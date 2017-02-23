(function () {
    'use strict';

    const today = Number(new Date());
    let day = 1000 * 60 * 60 * 24;
    let legendHeight = 30;

    let polymerConfig = {
        is: 'pb-time-series-chart',
        behaviors: [
            Polymer.IronResizableBehavior
        ],
        properties: {
            data: {
                type: Array,
                observer: '_dataChanged',
                notify: true
            },
            d3Cache: {
                type: Object,
                value: {}
            },

            initialized: Boolean,
            viewport: Object,
            elementWidth: Number,
            chartViewport: Object,
            sortedData: Object
        },
        listeners: {
            'iron-resize': '_onIronResize'
        },
        attached: function () {
            this.viewport = this.getViewPort();
            this.elementWidth = this.viewport.clientWidth;
            this.sortedData = sortData(this.data);
            this.d3Cache = init(this.viewport, this.data, this.sortedData);
            this.initialized = true;
        },
        getViewPort: function () { return this.$$('#chart-viewport'); },
        _dataChanged: function (newData) {
            this.sortedData = sortData(newData);
            if (this.initialized) {
                update(this.d3Cache, this.viewport, newData, this.sortedData);
            }
        },
        _onIronResize: function () {
            if (this.initialized) {
                update(this.d3Cache, this.viewport, this.data, this.sortedData);
            }
        }
    }

    Polymer(polymerConfig);

    function init(viewport, data, sortedData) {
        let chartViewport = d3.select(viewport);
        let svg = chartViewport.append('svg')
            .style('display', 'block');
        let width = viewport.clientWidth;
        let height = sortedData.length * 20 + 50;
        setViewPortSVGSize(svg, width, height);

        createDiagonalPattern(svg, 'diagonalPattern');
        let renderSVG = svg.append('g');

        let {axis: xAxis, scale: xScale} = createXAxis(data, width);

        let todayG = renderSVG.append('g');
        renderTodayMarker(todayG, xScale, height);
        let axisG = renderSVG.append('g')
            .attr('class', 'x axis');

        formatAxis(axisG, height, xAxis, xScale);

        let chartG = renderElements(sortedData, xScale, renderSVG);

        return {
            svg: svg,
            renderSVG: renderSVG,
            axisG: axisG,
            chartG: chartG,
            todayG: todayG
        }
    }

    /**
    * update the chart to
    * @param elementCache - a cache for svg elements
    */
    function update(elementCache, viewport, data, sortedData) {
        // TODO: only resort data when there's a data change, and not a resize
        // should probably cache sortedData somewhere esp if we ever want transitions
        let width = viewport.clientWidth;
        let height = sortedData.length * 20 + 50;
        setViewPortSVGSize(elementCache.svg, width, height);

        let {axis: xAxis, scale: xScale} = createXAxis(data, viewport.clientWidth);
        renderTodayMarker(elementCache.todayG, xScale, height);
        formatAxis(elementCache.axisG, height, xAxis, xScale);


        //update chart view
        let {startCircleG, endCircleG, lineG, arrowG} = elementCache.chartG;
        renderLines(sortedData, xScale, lineG);
        renderStartCircles(sortedData, xScale, startCircleG);
        renderEndCircles(sortedData, xScale, endCircleG);
        renderArrows(sortedData, xScale, arrowG);

    }
    /**
    * sort the time series into non-clashing sectors to be rendered
    * @param data
    * @returns {Array<Array<projectData>>}
    */
    function sortData(data) {
        let sortedDataSet = [];
        let sortedData = data.slice().sort((a, b) => {
            let aEndDate = a.realEndDate || a.projectedEndDate;
            let bEndDate = b.realEndDate || b.projectedEndDate;
            return Number(aEndDate > bEndDate);
        });
        sortedData.forEach((timeData) => {
            let insertIndex = getFittingSlot(timeData, sortedDataSet);
            if (insertIndex === -1) {
                let newRow = [];
                newRow.push(timeData);
                sortedDataSet.push(newRow);
            } else {
                let addRow = sortedDataSet[insertIndex];
                addRow.push(timeData);
            }
        });
        return sortedDataSet;
    }

    /**
     * Initialize the time series elements and return the svg groups containing them for use in rerendering
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @returns {}
     */
    function renderElements(sortedData, xScale, renderPort) {
        let lineG = renderPort.append('g');
        let startCircleG = renderPort.append('g');
        let endCircleG = renderPort.append('g');
        let arrowG = renderPort.append('g');

        renderLines(sortedData, xScale, lineG);
        renderStartCircles(sortedData, xScale, startCircleG);
        renderEndCircles(sortedData, xScale, endCircleG);
        renderArrows(sortedData, xScale, arrowG);

        return {
            startCircleG: startCircleG,
            endCircleG: endCircleG,
            lineG: lineG,
            arrowG: arrowG
        };
    }

    /**
     * get the starting position circles
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @returns {Selection}
     */
    function renderStartCircles(sortedData, xScale, renderPort) {
        return renderCircles(sortedData, xScale, renderPort,
            (data) => data.realStartDate);
    }

    /**
     * get the ending position circles
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @returns {Selection}
     */
    function renderEndCircles(sortedData, xScale, renderPort) {
        return renderCircles(sortedData, xScale, renderPort,
            (data) => data.realEndDate,
            (data) => isBeforeToday(data));
    }

    //TODO: separate this out
    /**
     * render all the line objects. This actually use rectangles under the hood because
     * this lets us use textures.
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @returns {Selection}
     */
    function renderLines(sortedData, xScale, renderPort) {
        let pts = sortedData.reduce((arr, data, index) => {
            let ptsArr = data.map((timeData) => {
                let {id, fill, projectedStartDate, realStartDate, realEndDate, projectedEndDate} = timeData;
                let solidEnd = Math.min(projectedEndDate, today);
                if (realEndDate) solidEnd = Math.min(realEndDate, solidEnd);

                let dashedEnd;
                if (realEndDate) {
                    dashedEnd = (realEndDate < projectedEndDate) ? null : Math.min(realEndDate, today);
                }
                else {
                    dashedEnd = (projectedEndDate < today) ? today : null;
                }
                return {
                    x1: realStartDate,
                    x2: solidEnd,
                    x3: dashedEnd,
                    greyLineStartX: projectedStartDate,
                    greyLineEndX: (realEndDate) ? realStartDate : projectedEndDate,
                    y: index,
                    id: id,
                    fill: fill
                }
            });
            return arr.concat(ptsArr);
        }, []);
        let dashedPts = pts.filter((pt) => pt.x3);

        renderPort.selectAll('rect').remove();
        let greyLines = renderPort.selectAll('.grey-lines')
            .data(pts);
        let solidLines = renderPort.selectAll('.solid-lines')
            .data(pts);
        let dashedLines = renderPort.selectAll('.dashed-lines')
            .data(dashedPts);

        greyLines
            .enter()
            .append('rect')
            .attr('class', 'grey-lines')
            .attr('x', (d) => xScale(d.greyLineStartX))
            .attr('width', (d) => xScale(d.greyLineEndX) - xScale(d.greyLineStartX))
            .attr('y', (d) => getYCoord(d.y) - 1)
            .attr('height', 3)
            .attr('opacity', 0.23)
            .style('fill', (d) => d.fill);

        solidLines
            .enter()
            .append('rect')
            .attr('class', 'solid-lines')
            .attr('x', (d) => xScale(d.x1))
            .attr('width', (d) => xScale((d.x3) ? d.x3 : d.x2) - xScale(d.x1))
            .attr('y', (d) => getYCoord(d.y) - 1)
            .attr('height', 3)
            .style('fill', (d) => d.fill);

        dashedLines
            .enter()
            .append('rect')
            .attr('class', 'dashed-lines')
            .attr('x', (d) => xScale(d.x2))
            .attr('width', (d) => xScale(d.x3) - xScale(d.x2))
            .attr('y', (d) => getYCoord(d.y) - 1)
            .attr('height', 3)
            .style('fill', "url(#diagonalPattern)");

        return solidLines;
    }

    /**
     * render circles on to the svg canvas
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @param retrieveX
     * @param filter
     * @returns {Selection}
     */
    function renderCircles(sortedData, xScale, renderPort, retrieveX, filter) {
        let pts = sortedData.reduce((arr, data, index) => {
            let workingData = (filter) ? data.filter(filter) : data;
            let ptsArr = workingData.map((timeData) => {
                return {
                    x: retrieveX(timeData),
                    y: index,
                    id: timeData.id,
                    fill: timeData.fill
                }
            });
            return arr.concat(ptsArr);
        }, []);

        renderPort.selectAll('circle').remove();
        let circles = renderPort.selectAll('circle')
            .data(pts);

        circles
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.x))
            .attr('cy', (d) => getYCoord(d.y))
            .attr('r', 4)
            .style('fill', (d) => d.fill);

        return circles;
    }

    /**
     * render triangle arrows
     * @param sortedData
     * @param xScale
     * @param renderPort
     * @returns {Selection}
     */
    function renderArrows(sortedData, xScale, renderPort) {
        let pts = sortedData.reduce((arr, data, index) => {
            let ptsArr = data.filter((data) => !data.realEndDate)
                .map((timeData) => {
                    return {
                        x: today,
                        y: index,
                        id: timeData.id,
                        fill: timeData.fill
                    }
                });
            return arr.concat(ptsArr);
        }, []);

        renderPort.selectAll('polyline').remove();
        let arrows = renderPort.selectAll('polyline').data(pts);
        arrows
            .enter()
            .append('polyline')
            .attr('points', (d) => generateTrianglePts(xScale(d.x), getYCoord(d.y)))
            .style('fill', (d) => d.fill);
        return arrows;
    }

    function renderTodayMarker(renderPort, xScale, height) {
        let x = xScale(today);
        let y = height - legendHeight;
        renderPort.selectAll('circle')
            .remove();

        renderPort.append('circle')
            .attr('r', 6)
            .attr('cx', x)
            .attr('cy', y)
            .style('fill', '#999');

        renderPort.append('circle')
            .attr('r', 2)
            .attr('cx', x)
            .attr('cy', y)
            .style('fill', '#fff');

    }

    function formatAxis(g, height, axis, xScale) {
        g.call(axis);
        g.select(".domain").remove();
        let ticks = g.selectAll(".tick");

        ticks.selectAll('line')
            .attr('y1', 0)
            .attr('y2', -height)
            .style('stroke-dasharray', ("3, 3"))
            .style('stroke', '#ddd');

        ticks.selectAll('text')
            .text((d) => {
                let dateStr = d.toString();
                return dateStr.substring(4, 7);
            })
            .attr('x', (d) => getMonthBoxWidth(d, xScale) / 2)
            .style('fill', '#fff')
            .style('font-size', 13.5);

        ticks.selectAll('rect').remove();
        let tickOdd = ticks.filter((d, i) => i % 2 === 0);
        let tickEven = ticks.filter((d, i) => i % 2 === 1);
        tickOdd.insert('rect', ':first-child')
            .attr('fill', '#9013FE');
        tickEven.insert('rect', ':first-child')
            .attr('fill', '#7E00ED');
        let allRects = ticks.selectAll('rect');

        resizeAndPositionRects(allRects, xScale);
        // position axis
        g.attr('transform', `translate(0,${height - legendHeight})`);
    }

    /*==================================
     Helper Functions
     ==================================*/

    function generateTrianglePts(x, y) {
        return `${x} ${y - 4},${x + 6} ${y},${x} ${y + 4},${x} ${y - 4}`;
    }

    function getYCoord(yIndex) {
        return yIndex * 20 + 25;
    }

    function isBeforeToday(data) {
        return (data.realEndDate) ?
            data.realEndDate <= today :
            data.projectedEndDate < today;
    }

    function createDiagonalPattern(svg, id) {
        let defs = svg.append('defs');
        let pattern = defs.append('pattern')
            .attr('id', id)
            .attr('width', 3)
            .attr('height', 15)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', 'rotate(45)');

        pattern.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 15)
            .style('stroke', 'white')
            .style('stroke-width', '3px');

    }

    function getFittingSlot(data, set) {
        for (let i = 0; i < set.length; i++) {
            let row = set[i];
            let lastData = row[row.length - 1];
            let lastEndDate = lastData.realEndDate || today;
            if (data.projectedStartDate > lastEndDate + day * 5) return i;
        }
        return -1;
    }

    function resizeAndPositionRects(allRects, xScale) {
        allRects
            .attr('class', 'bg-rect')
            .attr('width', (d) => getMonthBoxWidth(d, xScale))
            .attr('height', legendHeight);
    }

    function getMonthBoxWidth(d, xScale) {
        let month = d.getMonth();
        let year = d.getYear();
        let dateInMonth = findNumberOfDaysInMonth(month, year);
        let startTime = d.getTime();
        let endTime = startTime + day * dateInMonth;
        return xScale(endTime) - xScale(startTime);
    }

    function createXAxis(dataSet, elementWidth) {
        let xScale = getXRange(dataSet, elementWidth);
        return {
            axis: d3.axisBottom(xScale)
                .ticks(d3.timeMonth),
            scale: xScale
        }
    }

    function setViewPortSVGSize(svg, width, height) {
        svg
            .attr('width', width)
            .attr('height', height);
    }

    function getXRange(dataSet, elementWidth) {
        let avgMonth = day * 30;
        let minMax = dataSet.reduce((extrema, data) => {
            extrema[0] = Math.min(extrema[0], data.realStartDate);
            let endDate = Math.min(data.projectedEndDate, today);
            endDate = (data.realEndDate) ? Math.min(endDate, data.realEndDate) : endDate;
            extrema[1] = Math.max(extrema[1], endDate);
            return extrema;
        }, [Infinity, 0]);

        let start = new Date(minMax[0] - avgMonth);
        let end = new Date(Math.max(today, minMax[1]) + avgMonth);

        return d3.scaleTime()
            .range([0, elementWidth])
            .domain([start, end])
            .nice(d3.timeMonth);
    }

    function findNumberOfDaysInMonth(month, year) {
        if (month === 1) {
            return (year % 4 === 0) ? 29 : 28;
        }
        let monthEven = month % 2;
        if (month < 7) return 31 - monthEven;
        else return 30 + monthEven;
    }
})();