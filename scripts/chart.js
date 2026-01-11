window.onload = function() {
    let canvas = document.getElementById('chartCanvas');
    let context = canvas.getContext('2d');

    let width = canvas.width;
    let height = canvas.height;

    let xIncrement = 150;
    let yIncrement = 100;
    let valueIncrement = 20;
    let textOffset = 5;

    let data = [];
    let data2 = [];
    let data3 = [];
    let animationRunning = true;
    let updateInterval = 1000;
    let maxRange = 600;
    let showGrid = true;
    let chartType = 'line';
    let theme = 'light';
    let intervalId = null;

    function getColors() {
        const themes = {
            light: { grid: 'gray', bg: 'white', text: 'black', line1: 'green', line2: 'blue', line3: 'red' },
            dark: { grid: '#555', bg: '#2a2a2a', text: '#ccc', line1: '#4CAF50', line2: '#2196F3', line3: '#f44336' },
            contrast: { grid: '#fff', bg: '#000', text: '#fff', line1: '#00ff00', line2: '#0000ff', line3: '#ff0000' }
        };
        return themes[theme];
    }

    function drawVerticalLines() {
        const colors = getColors();
        if (!showGrid) return;
        context.strokeStyle = colors.grid;
        context.lineWidth = 1;
        
        for(let i = 0; i < width; i += xIncrement) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.stroke();
        }
    }

    function drawHorizontalLines() {
        const colors = getColors();
        if (!showGrid) return;
        context.strokeStyle = colors.grid;
        context.lineWidth = 1;

        for (let i = 0; i < height; i += yIncrement) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(width, i);
            context.stroke();
        }
    }

    function smoothData(dataArray) {
        if (dataArray.length < 3) return dataArray;
        let smoothed = [];
        for (let i = 0; i < dataArray.length; i++) {
            if (i === 0) smoothed.push(dataArray[i]);
            else if (i === dataArray.length - 1) smoothed.push(dataArray[i]);
            else smoothed.push((dataArray[i-1] + dataArray[i] + dataArray[i+1]) / 3);
        }
        return smoothed;
    }

    function drawLineChart(dataArray, lineColor) {
        context.strokeStyle = lineColor;
        context.lineWidth = 5;

        const smoothed = smoothData(dataArray);
        context.beginPath();
        context.moveTo(0, height - smoothed[0]);

        for (let i = 1; i < smoothed.length; i++) {
            context.lineTo(i * valueIncrement, height - smoothed[i]);
        }

        context.stroke();
    }

    function drawAreaChart(dataArray, lineColor) {
        context.fillStyle = lineColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
        context.strokeStyle = lineColor;
        context.lineWidth = 3;

        const smoothed = smoothData(dataArray);
        context.beginPath();
        context.moveTo(0, height - smoothed[0]);

        for (let i = 1; i < smoothed.length; i++) {
            context.lineTo(i * valueIncrement, height - smoothed[i]);
        }

        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();
        context.fill();
        context.stroke();
    }

    function drawBarChart(dataArray, barColor) {
        context.fillStyle = barColor;
        const barWidth = valueIncrement - 2;

        for (let i = 0; i < dataArray.length; i++) {
            context.fillRect(i * valueIncrement + 1, height - dataArray[i], barWidth, dataArray[i]);
        }
    }

    function drawScatterChart(dataArray, dotColor) {
        context.fillStyle = dotColor;

        for (let i = 0; i < dataArray.length; i++) {
            context.beginPath();
            context.arc(i * valueIncrement, height - dataArray[i], 4, 0, 2 * Math.PI);
            context.fill();
        }
    }

    function drawChart() {
        const colors = getColors();
        
        if (chartType === 'line') {
            drawLineChart(data, colors.line1);
            drawLineChart(data2, colors.line2);
            drawLineChart(data3, colors.line3);
        } else if (chartType === 'bar') {
            drawBarChart(data, colors.line1);
        } else if (chartType === 'area') {
            drawAreaChart(data, colors.line1);
        } else if (chartType === 'scatter') {
            drawScatterChart(data, colors.line1);
        }
    }

    function drawVerticalLabels() {
        const colors = getColors();
        context.fillStyle = colors.text;
        context.font = '12px Arial';
        
        for (let i = 0; i < height; i += yIncrement) {
            context.fillText(height - i, textOffset, i + 2 * textOffset);
        }
    }

    function drawHorizontalLabels() {
        const colors = getColors();
        context.fillStyle = colors.text;
        context.font = '12px Arial';
        
        for (let i = 0; i < width; i += xIncrement) {
            context.fillText(i, i + textOffset, height - textOffset);
        }
    }

    function generateRandomNumber() {
        return parseInt(Math.random() * maxRange);
    }

    function generateData() {
        for (let i = 0; i <= width; i += valueIncrement) {
            data[i / valueIncrement] = generateRandomNumber();
            data2[i / valueIncrement] = generateRandomNumber();
            data3[i / valueIncrement] = generateRandomNumber();
        }
    }

    function draw() {
        const colors = getColors();
        context.fillStyle = colors.bg;
        context.fillRect(0, 0, width, height);
        
        drawVerticalLines();
        drawHorizontalLines();
        drawVerticalLabels();
        drawHorizontalLabels();
        drawChart();
    }

    function generateNewValue() {
        let newValue = generateRandomNumber();
        data.push(newValue);
        data.shift();
        
        newValue = generateRandomNumber();
        data2.push(newValue);
        data2.shift();
        
        newValue = generateRandomNumber();
        data3.push(newValue);
        data3.shift();
    }

    function updateStats() {
        const current = data[data.length - 1];
        const max = Math.max(...data);
        const min = Math.min(...data);
        const avg = Math.round(data.reduce((a, b) => a + b) / data.length);
        const trend = data[data.length - 1] > data[data.length - 2] ? '↑' : '↓';
        
        document.getElementById('currentValue').textContent = current;
        document.getElementById('maxValue').textContent = max;
        document.getElementById('minValue').textContent = min;
        document.getElementById('avgValue').textContent = avg;
        document.getElementById('trendValue').textContent = trend;
    }

    function startAnimation() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(function() {
            generateNewValue();
            draw();
            updateStats();
        }, updateInterval);
    }

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const dataIndex = Math.floor(x / valueIncrement);
        
        if (dataIndex >= 0 && dataIndex < data.length) {
            const tooltip = document.getElementById('tooltip');
            const value = Math.round(data[dataIndex]);
            
            tooltip.textContent = `Value: ${value}`;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX - rect.left + 10) + 'px';
            tooltip.style.top = (event.clientY - rect.top - 20) + 'px';
        }
    });

    canvas.addEventListener('mouseleave', function() {
        document.getElementById('tooltip').style.display = 'none';
    });

    document.getElementById('playPauseBtn').addEventListener('click', function() {
        animationRunning = !animationRunning;
        this.textContent = animationRunning ? 'Pause' : 'Play';
        if (animationRunning) startAnimation();
        else clearInterval(intervalId);
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        generateData();
        draw();
        updateStats();
    });

    document.getElementById('speedInput').addEventListener('change', function() {
        updateInterval = parseInt(this.value);
        if (animationRunning) startAnimation();
    });

    document.getElementById('rangeInput').addEventListener('change', function() {
        maxRange = parseInt(this.value);
    });

    document.getElementById('gridToggle').addEventListener('change', function() {
        showGrid = this.checked;
        draw();
    });

    document.getElementById('downloadBtn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'chart.png';
        link.click();
    });

    document.getElementById('lineChartBtn').addEventListener('click', function() {
        chartType = 'line';
        document.querySelectorAll('.chart-types button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('barChartBtn').addEventListener('click', function() {
        chartType = 'bar';
        document.querySelectorAll('.chart-types button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('areaChartBtn').addEventListener('click', function() {
        chartType = 'area';
        document.querySelectorAll('.chart-types button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('scatterBtn').addEventListener('click', function() {
        chartType = 'scatter';
        document.querySelectorAll('.chart-types button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('lightThemeBtn').addEventListener('click', function() {
        theme = 'light';
        document.body.classList.remove('dark-theme', 'contrast-theme');
        document.querySelectorAll('.themes button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('darkThemeBtn').addEventListener('click', function() {
        theme = 'dark';
        document.body.classList.remove('light-theme', 'contrast-theme');
        document.body.classList.add('dark-theme');
        document.querySelectorAll('.themes button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    document.getElementById('contrastThemeBtn').addEventListener('click', function() {
        theme = 'contrast';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add('contrast-theme');
        document.querySelectorAll('.themes button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        draw();
    });

    generateData();
    draw();
    updateStats();
    startAnimation();
}