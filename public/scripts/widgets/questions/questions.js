Backbone.widget({
    template: false,
    mapObjects:{},
    answers:[],
    mapQuestions:[],
    events: {
        "click #confirm-start": "enableDrag"


    },

    listen: {
        'START_MAP_QUESTIONS': 'startQuestions'
    },

    loaded: function () {

    },

    startQuestions: function(data){
        console.log(data);
        this.mapObjects = data.mapObjects;
        this.mapQuestions = _.cloneDeep(data.mapObjects.specialPoints);
        this.render();
    },

    render: function(){
        this.renderTemplate({

            template: 'questions',
            data: this.model,
            renderCallback: function () {
                this.showQuestion()
            }
        })
    },

    showQuestion: function(){

        this.answers = [];
        var randomIndex = this.getRandomNumber(0, this.mapQuestions.length -1);
        this.answers.push(randomIndex);
        this.getThreeAnswers();

        var question = this.mapQuestions[randomIndex];
        console.log(question, this.answers);
    },

    getThreeAnswers:function (){

        var number = this.getRandomNumber(0, this.mapObjects.specialPoints.length -1);

        if(this.answers.indexOf(number) == -1){
            this.answers.push(number)
        }

        if(this.answers.length == 3){
            return;
        }else{
            this.getThreeAnswers();
        }

    },

    getRandomNumber: function(bottom, top){
        return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
    }

}, ['map','typewriter', 'jqueryui']);