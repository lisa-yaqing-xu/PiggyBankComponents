(function () {
    'use strict';

    class PBTimeSeriesChart extends Polymer.Element {
        static get is() {
            return 'pb-time-series-chart';
        }

        static get properties() {
            return {
                data: {
                    type: Array,
                    notify: true,
                },
                d3Cache: {
                    type: Object
                },
                placeholderDates: {
                    type: Object,
                    notify: true,
                },
                addProjMode: {
                    type: Boolean,
                    value: false
                },
                placeholderColor: {
                    type: String,
                    notify: true
                },
                initialized: Boolean,
                viewport: Object,
                elementWidth: Number,
                chartViewport: Object,
                sortedData: Object,
                combinedData: Object,
                placeholderData: Object
            }
        }

        static get observers() {
            return [
                '_dataChanged(data)',
                '_placeholderChanged(placeholderDates)',
                '_placeholderColorChanged(placeholderColor)'
            ]
        }


        constructor() {
            
            super();
            this.today = Number(new Date());
            this.day = 1000 * 60 * 60 * 24;
            this.legendHeight = 30;

            //initialize array/object datastructures here because this will create a new instance and not interfere
            //with any other instance of chart.
            this.placeholderDates = {};
            this.data = [];
            this.d3Cache = {};
            console.log('asdf')
        }

        connectedCallback() {
            super.connectedCallback();
            Polymer.RenderStatus.beforeNextRender(this, function () {
                this.viewport = this.getViewPort();
                this.elementWidth = this.viewport.clientWidth;

                this.placeholderData = this.transformPlaceholder(this.placeholderDates);
                this.combinedData = this.combineMainAndPlaceholderData(this.combinedData, this.placeholderData)

                this.sortedData = this.sortData(this.combinedData);

                this.d3Cache = this.init(this.viewport, this.combinedData, this.sortedData, this.addProjMode);
                this.initialized = true;

                window.addEventListener('resize', () => { this.rerenderDataIfInitialized(); })
            });

        }

        getViewPort() { return this.shadowRoot.getElementById('chart-viewport') }

        _dataChanged(newData) {
            console.log('data',newData);
            this.updateData();
        }

        _placeholderChanged(newData) {
            console.log('placeholder', newData);
            this.updateData();
        }

        _placeholderColorChanged(newColor) {
            // Currently it will resort and rerender everything on a simple color change, 
            // which is fairly inefficient and definitely more expensive but if 
            // it doesn't cause any latency there isn't really any reason to change it, since it's a lot less
            // code I have to maintain here. If it does end up lagging though, let me know. I have a way of 
            // making this a lot faster but it's gonna add a lot more complexity and I'm not sure if worth. 
            let hasData = (this.placeholderData) ?
                Object.keys(this.placeholderData).reduce((has, field) => {
                    if (this.placeholderData[field] != null) return true;
                    else return has || false;
                }, false) : false;
            console.log(hasData);
            if (hasData) {
                this.updateData();
            }

        }

        updateData() {
            this.placeholderData = this.transformPlaceholder(this.placeholderDates);
            this.combinedData = this.combineMainAndPlaceholderData(this.data, this.placeholderData)
            this.sortedData = this.sortData(this.combinedData);

            this.rerenderDataIfInitialized();
        }


        rerenderDataIfInitialized() {
            if (this.initialized) {
                this.update(this.d3Cache, this.viewport, this.combinedData, this.sortedData, this.addProjMode);
            }
        }

        init(viewport, data, sortedData, addProjMode) {
            let chartViewport = d3.select(viewport);
            let svg = chartViewport.append('svg')
                .style('display', 'block');
            let width = viewport.clientWidth;
            let height = sortedData.length * 20 + 50;
            this.setViewPortSVGSize(svg, width, height);

            this.createDiagonalPattern(svg, 'diagonalPattern');
            let renderSVG = svg.append('g');

            let { axis: xAxis, scale: xScale } = this.createXAxis(data, width);

            let todayG = renderSVG.append('g');
            this.renderTodayMarker(todayG, xScale, height);
            let axisG = renderSVG.append('g')
                .attr('class', 'x axis');

            this.formatAxis(axisG, height, xAxis, xScale);

            let chartG = this.renderElements(sortedData, xScale, renderSVG, addProjMode);

            return {
                svg: svg,
                renderSVG: renderSVG,
                axisG: axisG,
                chartG: chartG,
                todayG: todayG,
            }
        }

        /**
        * update the chart to
        * @param elementCache - a cache for svg elements
        */
        update(elementCache, viewport, data, sortedData, addProjMode) {
        
            let width = viewport.clientWidth;
            let height = sortedData.length * 20 + 50;
            this.setViewPortSVGSize(elementCache.svg, width, height);

            let { axis: xAxis, scale: xScale } = this.createXAxis(data, viewport.clientWidth);
            this.renderTodayMarker(elementCache.todayG, xScale, height);
            this.formatAxis(elementCache.axisG, height, xAxis, xScale);


            //update chart view
            let { startCircleG, endCircleG, lineG, arrowG } = elementCache.chartG;
            this.renderLines(sortedData, xScale, lineG, addProjMode);
            this.renderStartCircles(sortedData, xScale, startCircleG, addProjMode);
            this.renderEndCircles(sortedData, xScale, endCircleG, addProjMode);
            this.renderArrows(sortedData, xScale, arrowG, addProjMode);

        }
        /**
        * sort the time series into non-clashing sectors to be rendered
        * @param data
        * @returns {Array<Array<projectData>>}
        */
        sortData(data) {
            let sortedDataSet = [];
            let sortedData = data.slice().sort((a, b) => {
                let aEndDate = a.realEndDate || a.projectedEndDate;
                let bEndDate = b.realEndDate || b.projectedEndDate;
                return Number(aEndDate > bEndDate);
            });
            sortedData.forEach((timeData) => {
                let insertIndex = this.getFittingSlot(timeData, sortedDataSet);
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
        renderElements(sortedData, xScale, renderPort, addProjMode) {
            let lineG = renderPort.append('g');
            let startCircleG = renderPort.append('g');
            let endCircleG = renderPort.append('g');
            let arrowG = renderPort.append('g');

            this.renderLines(sortedData, xScale, lineG, addProjMode);
            this.renderStartCircles(sortedData, xScale, startCircleG, addProjMode);
            this.renderEndCircles(sortedData, xScale, endCircleG, addProjMode);
            this.renderArrows(sortedData, xScale, arrowG, addProjMode);

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
        renderStartCircles(sortedData, xScale, renderPort, addProjMode) {
            return this.renderCircles(sortedData, xScale, renderPort, addProjMode,
                (data) => data.realStartDate);
        }

        /**
         * get the ending position circles
         * @param sortedData
         * @param xScale
         * @param renderPort
         * @returns {Selection}
         */
        renderEndCircles(sortedData, xScale, renderPort, addProjMode) {
            return this.renderCircles(sortedData, xScale, renderPort, addProjMode,
                (data) => data.realEndDate,
                (data) => this.isBeforeToday(data));
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
        renderLines(sortedData, xScale, renderPort, addProjMode) {
            let pts = sortedData.reduce((arr, data, index) => {
                let ptsArr = data.map((timeData) => {
                    let { id, fill, projectedStartDate, realStartDate, realEndDate, projectedEndDate, isPlaceholder } = timeData;
                    let solidEnd = Math.min(projectedEndDate, this.today);
                    if (realEndDate) solidEnd = Math.min(realEndDate, solidEnd);

                    let dashedEnd;
                    if (realEndDate) {
                        dashedEnd = (realEndDate < projectedEndDate) ? null : Math.min(realEndDate, this.today);
                    }
                    else {
                        dashedEnd = (projectedEndDate < this.today) ? this.today : null;
                    }
                    return {
                        x1: realStartDate,
                        x2: solidEnd,
                        x3: dashedEnd,
                        greyLineStartX: projectedStartDate,
                        greyLineEndX: (realEndDate) ? realStartDate : projectedEndDate,
                        y: index,
                        id: id,
                        fill: (addProjMode && !isPlaceholder) ? this.rgbToGrayScale(fill) : fill
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
                .attr('y', (d) => this.getYCoord(d.y) - 1)
                .attr('height', 3)
                .attr('opacity', 0.23)
                .style('fill', (d) => d.fill);

            solidLines
                .enter()
                .append('rect')
                .attr('class', 'solid-lines')
                .attr('x', (d) => xScale(d.x1))
                .attr('width', (d) => xScale((d.x3) ? d.x3 : d.x2) - xScale(d.x1))
                .attr('y', (d) => this.getYCoord(d.y) - 1)
                .attr('height', 3)
                .style('fill', (d) => d.fill);

            dashedLines
                .enter()
                .append('rect')
                .attr('class', 'dashed-lines')
                .attr('x', (d) => xScale(d.x2))
                .attr('width', (d) => xScale(d.x3) - xScale(d.x2))
                .attr('y', (d) => this.getYCoord(d.y) - 1)
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
        renderCircles(sortedData, xScale, renderPort, addProjMode, retrieveX, filter) {
            let pts = sortedData.reduce((arr, data, index) => {
                let workingData = (filter) ? data.filter(filter) : data;
                let ptsArr = workingData.map((timeData) => {
                    return {
                        x: retrieveX(timeData),
                        y: index,
                        id: timeData.id,
                        fill: (addProjMode && !timeData.isPlaceholder) ? this.rgbToGrayScale(timeData.fill) : timeData.fill
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
                .attr('cy', (d) => this.getYCoord(d.y))
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
        renderArrows(sortedData, xScale, renderPort, addProjMode) {
            let pts = sortedData.reduce((arr, data, index) => {
                let ptsArr = data.filter((data) => !data.realEndDate)
                    .map((timeData) => {
                        return {
                            x: this.today,
                            y: index,
                            id: timeData.id,
                            fill: (addProjMode && !timeData.isPlaceholder) ? this.rgbToGrayScale(timeData.fill) : timeData.fill
                        }
                    });
                return arr.concat(ptsArr);
            }, []);

            renderPort.selectAll('polyline').remove();
            let arrows = renderPort.selectAll('polyline').data(pts);
            arrows
                .enter()
                .append('polyline')
                .attr('points', (d) => this.generateTrianglePts(xScale(d.x), this.getYCoord(d.y)))
                .style('fill', (d) => d.fill);
            return arrows;
        }

        renderTodayMarker(renderPort, xScale, height) {
            let x = xScale(this.today);
            let y = height - this.legendHeight;
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

        formatAxis(g, height, axis, xScale) {
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
                .attr('x', (d) => this.getMonthBoxWidth(d, xScale) / 2)
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

            this.resizeAndPositionRects(allRects, xScale);
            // position axis
            g.attr('transform', `translate(0,${height - this.legendHeight})`);
        }

        /*==================================
         Helper Functions
         ==================================*/

        generateTrianglePts(x, y) {
            return `${x} ${y - 4},${x + 6} ${y},${x} ${y + 4},${x} ${y - 4}`;
        }

        getYCoord(yIndex) {
            return yIndex * 20 + 25;
        }

        isBeforeToday(data) {
            return (data.realEndDate) ?
                data.realEndDate <= this.today :
                data.projectedEndDate < this.today;
        }

        createDiagonalPattern(svg, id) {
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

        getFittingSlot(data, set) {
            for (let i = 0; i < set.length; i++) {
                let row = set[i];
                let lastData = row[row.length - 1];
                let lastEndDate = lastData.realEndDate || this.today;
                if (data.projectedStartDate > lastEndDate + this.day * 5) return i;
            }
            return -1;
        }

        resizeAndPositionRects(allRects, xScale) {
            allRects
                .attr('class', 'bg-rect')
                .attr('width', (d) => this.getMonthBoxWidth(d, xScale))
                .attr('height', this.legendHeight);
        }

        getMonthBoxWidth(d, xScale) {
            let month = d.getMonth();
            let year = d.getYear();
            let dateInMonth = this.findNumberOfDaysInMonth(month, year);
            let startTime = d.getTime();
            let endTime = startTime + this.day * dateInMonth;
            return xScale(endTime) - xScale(startTime);
        }

        createXAxis(dataSet, elementWidth) {
            let xScale = this.getXRange(dataSet, elementWidth);
            return {
                axis: d3.axisBottom(xScale)
                    .ticks(d3.timeMonth),
                scale: xScale
            }
        }

        setViewPortSVGSize(svg, width, height) {
            svg
                .attr('width', width)
                .attr('height', height);
        }

        getXRange(dataSet, elementWidth) {
            let avgMonth = this.day * 30;
            let minMax = dataSet.reduce((extrema, data) => {
                extrema[0] = Math.min(extrema[0], data.realStartDate);
                let endDate = Math.min(data.projectedEndDate, this.today);
                endDate = (data.realEndDate) ? Math.min(endDate, data.realEndDate) : endDate;
                extrema[1] = Math.max(extrema[1], endDate);
                return extrema;
            }, [Infinity, 0]);

            let start = new Date(minMax[0] - avgMonth);
            let end = new Date(Math.max(this.today, minMax[1]) + avgMonth);

            return d3.scaleTime()
                .range([0, elementWidth])
                .domain([start, end])
                .nice(d3.timeMonth);
        }

        findNumberOfDaysInMonth(month, year) {
            if (month === 1) {
                return (year % 4 === 0) ? 29 : 28;
            }
            let monthEven = month % 2;
            if (month < 7) return 31 - monthEven;
            else return 30 + monthEven;
        }

        rgbToGrayScale(rgb) {
            let { r, g, b } = this.separateRGB(rgb);
            let rInt = parseInt(r, 16);
            let gInt = parseInt(g, 16);
            let bInt = parseInt(b, 16);

            let x = 0.299 * rInt + 0.587 * gInt + 0.114 * bInt;
            let xHex = Math.floor(x).toString(16);
            if (xHex.length === 1) xHex = [0, xHex].join('');
            return `#${this.duplicateString(xHex, 3)}`;
        }

        separateRGB(rgb) {
            let strippedRGB = (rgb.charAt(0) === '#') ? rgb.substring(1, rgb.length) : rgb;
            let r, g, b;
            if (strippedRGB.length === 6) {
                r = strippedRGB.substring(0, 2);
                g = strippedRGB.substring(2, 4);
                b = strippedRGB.substring(4, 6);

            } else if (strippedRGB.length === 3) {
                r = this.duplicateString(strippedRGB.charAt(0));
                g = this.duplicateString(strippedRGB.charAt(1));
                b = this.duplicateString(strippedRGB.charAt(2));
            } else {
                throw "invalid color format"
            }
            return { r, g, b }

        }

        duplicateString(str, times = 2) {
            let dupeArr = [];
            for (let i = 0; i < times; i++) {
                dupeArr.push(str);
            }
            return dupeArr.join('');
        }

        transformPlaceholder(data) {
            let transformedData = {};
            if (data.startDate) {
                transformedData.projectedStartDate = data.startDate;
                transformedData.realStartDate = data.startDate;
                if (data.endDate) {
                    transformedData.projectedEndDate = data.endDate;
                    transformedData.realEndDate = data.endDate;
                } else {
                    transformedData.projectedEndDate = data.startDate;
                    transformedData.realEndDate = data.startDate;
                }

            } else {
                if (data.endDate) {
                    transformedData.projectedEndDate = data.endDate;
                    transformedData.realEndDate = data.endDate;
                    transformedData.projectedStartDate = data.endDate;
                    transformedData.realStartDate = data.endDate;
                }

                else { return null; }
            }
            transformedData.id = 'placeholder'
            transformedData.fill = this.placeholderColor || '#fa4659';
            transformedData.isPlaceholder = true;
            return transformedData;
        }

        combineMainAndPlaceholderData(mainData, placeholderData) {
            if (placeholderData) {
                let mainDataCp = mainData.slice();
                mainDataCp.push(placeholderData);
                return mainDataCp;
            }
            return mainData;
        }

    }

    customElements.define(PBTimeSeriesChart.is, PBTimeSeriesChart);

})();