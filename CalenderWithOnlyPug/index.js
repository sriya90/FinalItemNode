const express = require('express')
const app = express()
const port = process.env.PORT|| 8000

var mongoose = require('mongoose');
mongoose.connect('mongodb://sriya:Asdf1234@ds137862.mlab.com:37862/events');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
      const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');
var eventSchema = new mongoose.Schema({
  startDate:     { type: String,  required: true },
  title:      { type: String,  required: true },
  description :  { type: String, required: true },
  location :  { type: String, required: true }
});
var eventsDB = mongoose.model('events', eventSchema);
var currentYear;
var currentMonth;
var currentDate;
var curId;
var db = mongoose.connection;
 var events =[]
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  app.get('/', (req, res) => {
      var d = new Date();
      var months = new Date(d.getYear(), d.getMonth(), 0).getDate();
       var date = new Date(d.getYear(), d.getMonth(), 1);
     console.log(createCal(d.getYear(), d.getMonth())) ;
      currentYear = (new Date()).getFullYear();
      currentMonth = d.getMonth();


     var hey = createCal(d.getYear(), d.getMonth());
      console.log("Before sending");

res.render('index', { days:d.getYear(),startDay:d.getMonth(),calArray:hey ,currentMonthYear:monthNames[d.getMonth()]+' '+currentYear});


});




function queryCollection(collection, callback){
    console.log(collection);
    console.log(currentYear);
  console.log(currentMonth);
       currentDate=collection+'-'+currentMonth+'-'+currentYear;
    console.log(currentDate)
    currentDate='1-11-2018'
                    db.collection('events').find({startDate: currentDate}).toArray( function (err, items) {
                       events.push(items);
                        callback();
                    });

}



      app.get('/nextMonth', (req, res) => {

          if(currentMonth==11)
              {
                  currentMonth=0;
                  currentYear++;
              }
          else
              currentMonth++;

     var hey = createCal(currentYear, currentMonth);



    res.render('index', { calArray:hey ,currentMonthYear:monthNames[currentMonth]+' '+currentYear})
  });


      app.get('/prevMonth', (req, res) => {

          if(currentMonth==0)
          {
              currentYear--;
              currentMonth =11;
          }else
              currentMonth--;
     var hey = createCal(currentYear, currentMonth);



    res.render('index', { calArray:hey ,currentMonthYear:monthNames[currentMonth]+' '+currentYear})
  });


function createCal(year, month) {
		var day = 1, i, j, haveDays = true,
				startDay = new Date(year, month, day).getDay(),
				daysInMonth = [31, (((year%4===0)&&(year%100!==0))||(year%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
				calendar = [];

console.log(year)
    console.log(month)
   console.log( daysInMonth[month])
		i = 0;
		while(haveDays) {
			calendar[i] = [];
			for (j = 0; j < 7; j++) {
				if (i === 0) {
					if (j === startDay) {
						calendar[i][j] = day++;


						startDay++;
					}
				} else if ( day <= daysInMonth[month]) {
					calendar[i][j] = day++;


				} else {
					calendar[i][j] = "";
					haveDays = false;
				}
				if (day > daysInMonth[month]) {
					haveDays = false;
				}
			}
			i++;
		}



		return calendar;
	}

    function findEvents()
    {
        var meevents=[];
        for(var i=0;i<31;i++)
            {
                meevents[i]=[];
                 currentDate=i+'-'+currentMonth+'-'+currentYear;
                currentDate = currentDate.toString();
                    console.log(currentDate);
                currentDate='1-11-2018';
                    db.collection('events').find({startDate: currentDate}).toArray( function (err, items) {
                        meevents[i]=items;

                    });

            }
        console.log(meevents);
        return meevents;

    }
  app.get('*/:id/event/new', (req, res) => {
    var dStart=req.params.id+'-'+monthNames[currentMonth]+'-'+currentYear;
      console.log(dStart);
    res.render('event-form', {title: "New Event For "+dStart, event:{} })
  });

    app.get('/calEvent/:id/getting', (req, res) => {
    let id = req.params.id
    curId =  req.params.id
       currentDate=id+'-'+monthNames[currentMonth]+'-'+currentYear;
       var startDate =currentDate;
        db.collection('events').find({startDate: currentDate.toString()}).toArray( function (err, items) {
        console.log(items);
          res.render('list-detail', { title: "Daily List of Events for "+currentDate,eventsOfTheDay:items })
    });

  });


    app.get('*/:id/event/new', (req, res) => {
    var dStart=req.params.id+'-'+monthNames[currentMonth]+'-'+currentYear;
      console.log(dStart);
    res.render('event-form', {title: "New Event For "+dStart, event:{} })
  });

//Weekly-view is not working properly
    app.get('/weeklyEvent/:id', (req, res) => {
    let id = req.params.id
    curId =  req.params.id
    var datesused = new Array();

      currentDate=id+'-'+monthNames[currentMonth]+'-'+currentYear;
      var startDate =currentDate;
        for(var i=1;i<=6;i++)
            {
              currentDate=id+'-'+monthNames[currentMonth]+'-'+currentYear;
              console.log(currentDate)
              datesused.push(currentDate.toString());

              id++;
            }
        var endDate = currentDate;

        db.collection('events').find({startDate:{ $in: datesused}}).toArray( function (err, items) {
        console.log(items);
          res.render('list-detail', { title: "Weekly List of Events for "+startDate+" "+currentDate,eventsOfTheDay:items })
    });

  });

  app.get('/events/:id/update', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    eventsDB.findById(id, function(err, event) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (event === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('event-form', { title: "Update Event", event: event })
        }
      }
    });
  });

  app.post('*/:id/event/new', function(req, res, next) {
      req.body.startDate=currentDate;
    let newEventSave = new eventsDB(req.body);
      newEventSave.startDate=currentDate;
      console.log(currentDate);
      console.log(newEventSave);
    newEventSave.save(function(err, savedEvent){
      if (err) {
        console.log(err)
        res.render('event-form', { event: newEventSave, error: err })
      } else {
        res.redirect('/calEvent/' + curId+'/getting');
      }
    });
  });

  app.get('/events/:id/update', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    eventsDB.findById(id, function(err, events) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (events === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('event-form', {  title: "Update Event", event: event })
        }
      }
    });
  });

  app.post('/events/:id/update', function(req, res, next) {
    let id = ObjectID.createFromHexString(req.params.id)
    eventsDB.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        res.redirect('/calEvent/' + curId+'/getting');
      }
    });
  });

  app.get('/events/:id/delete', function (req, res) {
    let id = ObjectID.createFromHexString(req.params.id)
    eventsDB.deleteOne({_id: id}, function(err, product) {
     res.redirect('/calEvent/' + curId+'/getting');

    });
  });

  app.post('/api/events', (req, res) => {
    console.log(req.body)
    let newEvent = new Event(req.body)

    eventsDB.save(function (err, savedSchedule) {
      if (err) {
        console.log(err)
        res.status(500).send("There was an internal error")
      } else {
        res.send(savedSchedule)
      }
    });
  });

  app.get('/api/events', (req, res) => {
    Schedule.find({}, function(err, schedules) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.send(schedules)
      }
    });
  });

  app.get('/api/events/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Schedule.findById(id, function(err, schedule) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        if (schedule === null) {
          res.status(404).send("Not found")
        } else {
          res.send(schedule)
        }
      }
    });
  });

  app.put('/api/event/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Schedule.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.status(204).send()
      }
    });
  });

  app.delete('/api/events/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    Schedule.deleteOne({"_id": id}, function(err) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.status(204).send()
      }
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
