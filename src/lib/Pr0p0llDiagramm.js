import Chart from 'chart.js';

export default class Pr0p0llDiagramm {
    constructor(data) {
        this.data = data;
        this.target = document.getElementById('container');
        this.link = document.createElement('a');
        this.textLength = 30;
        this.wordings = {
            country: {
                de: 'Deutschland',
                at: 'Österreich',
                ch: 'Schweiz',
                other: 'Andere'
            }
        };
        this.colors = [
            '#ee4d2e',
            '#1db992',
            '#bfbc06',
            '#008fff',
            '#ff0082',
            '#fc8833',
            '#5cb85c',
            '#d9534f',
            '#75c0c7'
        ];

        this.init();
    }


    static htmlDecode(input) {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        return doc.documentElement.textContent !== 'null' ? doc.documentElement.textContent : false;
    }


    static handleError(msg) {
        window.stop();
        document.body.innerHTML = `<p class="error">${msg}</p>`;
        return false;
    }


    init() {
        if (!this.data) {
            return Pr0p0llDiagramm.handleError('ID missing');
        }

        document.body.appendChild(this.link); // Hack for download

        let questions = this.getQuestions(this.data);

        for (let i = 1; i < questions.length; i++) {
            let dia = this.createPr0p0llDiagramm(questions[i][1], i);
            this.target.appendChild(dia.container);
            this.switchChart(dia.canvas, dia.answers);
        }
    }


    getQuestions(data) {
        let questions = Object.keys(data).map(function (key) {
            return [key, data[key]];
        });
        questions.splice(0, 0);

        return questions;
    }


    getAnswers(question) {
        let result = {
            titles: {
                long: [],
                short: [],
            },
            answers: [],
            values: [],
        };

        for (let i = 0; i < 20; i++) {
            if (question['a' + i]) {
                result.titles.long.push(Pr0p0llDiagramm.htmlDecode(question['a' + i].title));
                result.titles.short.push(this.truncate(Pr0p0llDiagramm.htmlDecode(question['a' + i].title)));
                result.values.push(question['a' + i].result.total);
                result.answers.push(question['a' + i]);
            }
        }

        return result;
    }


    createPr0p0llDiagramm(question, index) {
        let container = document.createElement('div');
        let wrapper = document.createElement('div');
        let canvas = document.createElement('canvas');
        const answers = this.getAnswers(question);
        const description = Pr0p0llDiagramm.htmlDecode(question.description);
        wrapper.className = 'wrapper';

        container.innerHTML = `<h3 id="question-${index}"><span>#${index}</span>${question.title}<small>${description ? description : ''}</small></h3>`;
        canvas.setAttribute('height', answers.answers.length * 40);
        canvas.setAttribute('width', 100);
        wrapper.appendChild(this.buildNav(canvas, answers));
        wrapper.appendChild(this.buildToolsBar(canvas, answers));
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        return {
            container: container,
            canvas: canvas,
            answers: answers
        };
    }


    switchChart(canvas, answers, type = 'horizontalBar', filter = false) {
        if (canvas.chart) {
            canvas.chart.data.datasets = this.getDatasets(answers, filter);
            canvas.chart.type = type;
            canvas.filter = filter;
            canvas.chart.update();

            return true;
        }

        let ctx = canvas.getContext('2d');
        canvas.chart = new Chart(ctx, {
            type: type,
            data: {
                labels: answers.titles.short,
                origTitles: answers.titles.long,
                datasets: this.getDatasets(answers, filter)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function (tooltipItem, data) {
                            return data.origTitles[tooltipItem[0].index];
                        },
                        label: function (tooltipItem, data) {
                            let dataset = data.datasets[tooltipItem.datasetIndex];
                            let currentValue = dataset.data[tooltipItem.index];
                            let global = 0;
                            let total = 0;
                            for (let i = 0; i < data.datasets.length; i++) {
                                if (typeof data.datasets[i].data === 'object') {
                                    total += data.datasets[i].data[tooltipItem.index];
                                    global += data.datasets[i].data.reduce(function (previousValue, currentValue, currentIndex, array) {
                                        return previousValue + currentValue;
                                    });
                                }
                            }

                            let percentage = Math.floor(((currentValue / total) * 100) + 0.5) || 0;
                            let globalPercentage = Math.floor(((currentValue / global) * 100) + 0.5) || 0;

                            if (data.datasets.length > 1) {
                                return `${percentage}% ${dataset.label} (${globalPercentage}% Global, ${currentValue} Votes)`;
                            }

                            return `${globalPercentage}% ${dataset.label} (${currentValue} Votes)`;
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        stacked: true,
                        gridLines: {
                            color: '#333'
                        },
                        ticks: {
                            fontColor: '#888',
                            fontSize: 14
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            color: '#333'
                        },
                        ticks: {
                            minRotation: 0,
                            maxRotation: 0,
                            fontColor: '#888',
                            fontSize: 14
                        }
                    }]
                },
                onClick: (e, data) => {
                    if (data[0]) {
                        let index = answers.answers[data[0]._index];
                        console.log(index);
                    }
                }
            }
        });
    }


    getNamedResults(result, answers, resultKey) {
        let resultData = [];

        for (let i = 0; i < answers.answers.length; i++) {
            let data = answers.answers[i].result[resultKey];

            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (!resultData[key]) {
                        resultData[key] = [];
                    }

                    resultData[key].push(data[key]);
                }
            }
        }

        let count = 0;
        for (let key in resultData) {
            if (resultData.hasOwnProperty(key)) {
                let label = key;

                if (this.wordings[resultKey]) {
                    label = this.wordings[resultKey][key];
                }

                result.push({
                    label: Pr0p0llDiagramm.htmlDecode(label),
                    data: resultData[key],
                    backgroundColor: this.colors[count]
                });

                count++;
            }
        }
    }


    getDatasets(answers, filter) {
        let result = [];

        switch (filter) {
            case 'age':
                this.getNamedResults(result, answers, 'age');
                break;
            case 'gender':
                let w = [];
                let m = [];

                for (let i = 0; i < answers.answers.length; i++) {
                    w.push(answers.answers[i].result.gender.w);
                    m.push(answers.answers[i].result.gender.m);
                }

                result.push({
                    label: 'Weiblich',
                    data: w,
                    backgroundColor: this.colors[0]
                });
                result.push({
                    label: 'Männlich',
                    data: m,
                    backgroundColor: this.colors[3]
                });
                break;
            case 'location':
                this.getNamedResults(result, answers, 'country');
                break;
            default:
                result.push({
                    label: 'Gesamtstimmen',
                    data: answers.values,
                    backgroundColor: this.getRandomColor()
                });
                break;
        }

        return result;
    }


    truncate(string) {
        if (string.length > this.textLength) {
            return string.substr(0, this.textLength) + '...';
        }

        return string;
    }


    buildNav(canvas, answers) {
        let nav = document.createElement('ul');
        nav.innerHTML = `
            <li><a data-filter="default" class="active"><span class="fa fa-bar-chart"></span></a></li>
	        <li><a data-filter="age" title="Verteilung nach Alter"><span class="fa fa-child"></span></a></li>
	        <li><a data-filter="gender" title="Geschlechteraufteilung"><span class="fa fa-mars"></span></a></li>
	        <li><a data-filter="location" title="Herkunftsland"><span class="fa fa-map-marker"></span></a></li>
	    `;

        nav.addEventListener('click', (e) => {
            let filter = e.target.parentNode.dataset.filter;

            if (filter) {
                let old = nav.getElementsByClassName('active')[0];
                if (old) {
                    old.classList.remove('active');
                }

                e.target.parentNode.classList.toggle('active');
                this.switchChart(canvas, answers, 'bar', filter);
            }
        });

        return nav;
    }


    buildToolsBar(canvas, answers) {
        let tools = document.createElement('ul');
        tools.className = 'toolbar';
        tools.innerHTML = `<a id="download" class="fa fa-download">Download</a><a id="switch" class="fa fa-pie-chart">Typ</a>`;

        tools.addEventListener('click', (e) => {
            switch (e.target.id) {
                case 'download':
                    this.downloadChart(canvas);
                    break;
                case 'switch':
                    let type = canvas.chart.config.type === 'bar' ? 'horizontalBar' : 'bar';
                    canvas.chart.destroy();
                    canvas.chart = false;
                    this.switchChart(canvas, answers, type, canvas.filter);
                    break;
            }
        });

        return tools;
    }


    downloadChart(canvas) {
        this.link.href = canvas.toDataURL('image/png');
        this.link.download = 'diagram.png';
        this.link.click();
    }


    getRandomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }
}
