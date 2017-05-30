(function () {
    'use strict';

    class PBProjectDetailChart extends Polymer.Element {
        static get is() {
            return 'pb-project-detail-chart';
        }

        static get properties() {
            return {
                data: {
                    type: Object,
                    notify: true,
                },
                d3Cache: {
                    type: Object
                },
                height:{
                    type: Number,
                    value: 150
                },
                initialized: Boolean,
                viewport: Object,
                elementWidth: Number,
                chartViewport: Object,
                sortedData: Object,
                combinedData: Object,
            }
        }

        static get observers() {
            return [
                '_dataChanged(data)'
            ]
        }


        constructor() {

            super();
            this.today = Number(new Date());
            this.day = 1000 * 60 * 60 * 24;
            this.legendHeight = 30;
            this.chartYPos = 60;

            this.data = {};
            this.d3Cache = {};
        }

        connectedCallback() {
            super.connectedCallback();
            Polymer.RenderStatus.beforeNextRender(this, function () {
                console.log(this.isBeforeToday(this.data));
                this.viewport = this.getViewPort();
                this.elementWidth = this.viewport.clientWidth;

                this.d3Cache = this.init(this.viewport, this.data);
                this.initialized = true;

                window.addEventListener('resize', () => { this.rerenderDataIfInitialized(); })
            });

        }

        getViewPort() { return this.shadowRoot.getElementById('chart-viewport') }

        _dataChanged(newData) {
            this.rerenderDataIfInitialized();
        }

        rerenderDataIfInitialized() {
            if (this.initialized) {
                this.update(this.d3Cache, this.viewport, this.data);
            }
        }

        init(viewport, data) {
            let chartViewport = d3.select(viewport);
            let svg = chartViewport.append('svg')
                .style('display', 'block');
            let width = viewport.clientWidth;
            let height = 150;
            this.setViewPortSVGSize(svg, width, height);

            this.createDiagonalPattern(svg, 'diagonalPattern');
            let renderSVG = svg.append('g');

            let { axis: xAxis, scale: xScale } = this.createXAxis(data, width);

            let axisG = renderSVG.append('g')
                .attr('class', 'x axis');

            this.formatAxis(axisG, height, xAxis, xScale);
            let chartG = this.createShapeGroups(renderSVG);

            this.renderElements(data, xScale, chartG);

            return {
                svg: svg,
                renderSVG: renderSVG,
                axisG: axisG,
                chartG: chartG,
            }
        }

        /**
        * update the chart to
        * @param elementCache - a cache for svg elements
        */
        update(elementCache, viewport, data) {

            let width = viewport.clientWidth;
            let height = 150;
            this.setViewPortSVGSize(elementCache.svg, width, height);

            let { axis: xAxis, scale: xScale } = this.createXAxis(data, width);       
            this.formatAxis(elementCache.axisG, height, xAxis, xScale);

            this.renderElements(this.data, xScale, elementCache.chartG);
        }

        createShapeGroups(renderPort) {
            return {
                lineG: renderPort.append('g').attr('class', 'line-wrapper'),
                circleG: renderPort.append('g').attr('class', 'circle-wrapper'),
                //arrowG: renderPort.append('g').attr('class', 'arrow-wrapper')
                tagG: renderPort.append('g').attr('class', 'tag-wrapper'),
            }
        }

        /**
         * Initialize the time series elements and return the svg groups containing them for use in rerendering
         * @param sortedData
         * @param xScale
         * @param renderGroups
         */
        renderElements(data, xScale, renderGroups) {

            let { lineG, circleG,/* arrowG,*/ tagG } = renderGroups;

            lineG.selectAll('rect').remove();
            circleG.selectAll('circle').remove();
            tagG.selectAll('polyline').remove();
            tagG.selectAll('text').remove();


            this.renderLines(data, xScale, lineG);
            this.renderCircles(data, xScale, circleG);
            this.renderTags(data, xScale, tagG);
            //if(!data.realEndDate) this.renderArrows(data, xScale,arrowG);

        }


        getLineData(data, xScale) {
            let { id, fill, projectedStartDate, realStartDate, realEndDate, projectedEndDate, isPlaceholder } = data;

            let dashedEnd, solidEnd;
            if (realEndDate) {
                solidEnd = realEndDate;
                dashedEnd = (realEndDate < projectedEndDate) ? null : realEndDate;
            }
            else if (projectedEndDate < this.today) {
                solidEnd = projectedEndDate;
                dashedEnd = this.today;
            }
            else {
                solidEnd = this.today;
                dashedEnd = null;
            }
            let lineData = {
                x1: realStartDate,
                x2: solidEnd,
                x3: dashedEnd,
                greyLineStartX: projectedStartDate,
                greyLineEndX: (realEndDate) ? realStartDate : projectedEndDate,
                id: id,
                fill: fill
            }

            return [lineData];
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
        renderLines(data, xScale, renderPort) {
            let lineHeight = 10;

            let lineData = this.getLineData(data);

            let greyLines = renderPort.selectAll('.grey-lines')
                .data(lineData);
            let solidLines = renderPort.selectAll('.solid-lines')
                .data(lineData);


            greyLines
                .enter()
                .append('rect')
                .attr('class', 'grey-lines')
                .attr('x', (d) => xScale(d.greyLineStartX))
                .attr('width', (d) => xScale(d.greyLineEndX) - xScale(d.greyLineStartX))
                .attr('y', (d) => this.chartYPos)
                .attr('height', lineHeight)
                //.attr('opacity', 0.23)
                .style('fill', '#CCCCCC');

            solidLines
                .enter()
                .append('rect')
                .attr('class', 'solid-lines')
                .attr('x', (d) => xScale(d.x1))
                .attr('width', (d) => xScale((d.x3) ? d.x3 : d.x2) - xScale(d.x1))
                .attr('y', (d) => this.chartYPos)
                .attr('height', lineHeight)
                .attr('opacity', 0.80)
                .style('fill', (d) => d.fill);

            if (lineData.filter(d => d.x3).length > 0) {
                let dashedLines = renderPort.selectAll('.dashed-lines')
                    .data(lineData);

                dashedLines
                    .enter()
                    .append('rect')
                    .attr('class', 'dashed-lines')
                    .attr('x', (d) => xScale(d.x2))
                    .attr('width', (d) => xScale(d.x3) - xScale(d.x2))
                    .attr('y', (d) => this.chartYPos)
                    .attr('height', lineHeight)
                    .style('fill', "url(#diagonalPattern)");
            }

            return solidLines;
        }


        getPointData(data, xScale) {
            let circles = [];

            let startCircleData = {
                x: data.realStartDate,
                id: data.id,
                fill: data.fill
            }

            circles.push(startCircleData);

            if (this.isBeforeToday(data)) {
                let endCircleData = {
                    x: data.realEndDate,
                    id: data.id,
                    fill: data.fill
                }
                circles.push(endCircleData);
            }
            return circles;
        }

        /**
         * render circles on to the svg canvas
         * @param sortedData
         * @param xScale
         * @param renderPort
         * @param retrieveX
         * @returns {Selection}
         */
        renderCircles(data, xScale, renderPort) {
            let circleData = this.getPointData(data);

            let circles = renderPort.selectAll('circle')
                .data(circleData);

            let radius = 10;
            circles
                .enter()
                .append('circle')
                .attr('cx', (d) => xScale(d.x))
                .attr('cy', (d) => this.chartYPos + radius / 2)
                .attr('r', radius)
                .style('fill', (d) => d.fill);

            return circles;
        }

        renderTags(data, xScale, renderPort) {
            let tagData = this.getPointData(data);

            let tags = renderPort.selectAll('polyline').data(tagData);
            let labels = renderPort.selectAll('text').data(tagData);

            tags
                .enter()
                .append('polyline')
                .attr('points', d => this.generateTagPts(xScale(d.x), this.chartYPos - 8))
                .style('fill', '#aaaaaa');

            labels
                .enter()
                .append('text')
                .text('p')//check time
                .attr('x', d => xScale(d.x) - 2)
                .attr('y', this.chartYPos - 15)
                .attr('font-size', 10)
                .attr('fill', '#fff');

        }

        /**
         * render triangle arrows
         * @param sortedData
         * @param xScale
         * @param renderPort
         * @returns {Selection}
         */
        renderArrows(data, xScale, renderPort) {
            let arrowPt = {
                x: this.today,
                id: data.id,
                fill: data.fill
            }

            let arrows = renderPort.selectAll('polyline').data([arrowPt]);
            arrows
                .enter()
                .append('polyline')
                .attr('points', (d) => this.generateTrianglePts(xScale(d.x), this.chartYPos + 1))
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
            return this.generateRightPointTriangle(x, y, 12, 10);
        }
        generateTagPts(x, y) {
            return this.generateBottomPointTriangle(x, y, 9, 15);
        }
        generateRightPointTriangle(x, y, m, n) {
            return `${x} ${y - n},${x + m} ${y},${x} ${y + n},${x} ${y - n}`;
        }
        generateBottomPointTriangle(x, y, m, n) {
            return `${x} ${y}, ${x - m} ${y - n}, ${x + m} ${y - n}, ${x} ${y}`;
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

        getXRange(data, elementWidth) {
            let start = Math.min(data.projectedStartDate, data.realStartDate);
            let end = data.realEndDate || Math.max(data.projectedEndDate, this.today);

            let buffer = Math.round((end - start) / 12);

            return d3.scaleTime()
                .range([0, elementWidth])
                .domain([start - buffer, end + buffer])
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


    }

    customElements.define(PBProjectDetailChart.is, PBProjectDetailChart);

})();