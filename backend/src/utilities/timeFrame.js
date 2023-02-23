function getCurrentWeek(base = 0) {
  let now = new Date()
  let dates = {
      "year": 2022,
      "endDate": "2023-01-11T07:59Z",
      "startDate": "2022-07-01T07:00Z",
      "weeks": [
          {
              "text": "Week 1",
              "label": "Week 1",
              "startDate": "2022-08-05T07:00Z",
              "endDate": "2022-09-06T06:59Z",
              "seasonType": 2,
              "weekNumber": 1,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/1/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Aug 5 - Sep 5"
          },
          {
              "text": "Week 2",
              "label": "Week 2",
              "startDate": "2022-09-06T07:00Z",
              "endDate": "2022-09-11T06:59Z",
              "seasonType": 2,
              "weekNumber": 2,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/2/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Sep 6 - 10"
          },
          {
              "text": "Week 3",
              "label": "Week 3",
              "startDate": "2022-09-11T07:00Z",
              "endDate": "2022-09-18T06:59Z",
              "seasonType": 2,
              "weekNumber": 3,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/3/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Sep 11 - 17"
          },
          {
              "text": "Week 4",
              "label": "Week 4",
              "startDate": "2022-09-18T07:00Z",
              "endDate": "2022-09-25T06:59Z",
              "seasonType": 2,
              "weekNumber": 4,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/4/year/2022/seasontype/2/group/80",
              "isActive": true,
              "dateRange": "Sep 18 - 24"
          },
          {
              "text": "Week 5",
              "label": "Week 5",
              "startDate": "2022-09-25T07:00Z",
              "endDate": "2022-10-02T06:59Z",
              "seasonType": 2,
              "weekNumber": 5,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/5/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Sep 25 - Oct 1"
          },
          {
              "text": "Week 6",
              "label": "Week 6",
              "startDate": "2022-10-02T07:00Z",
              "endDate": "2022-10-09T06:59Z",
              "seasonType": 2,
              "weekNumber": 6,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/6/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Oct 2 - 8"
          },
          {
              "text": "Week 7",
              "label": "Week 7",
              "startDate": "2022-10-09T07:00Z",
              "endDate": "2022-10-16T06:59Z",
              "seasonType": 2,
              "weekNumber": 7,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/7/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Oct 9 - 15"
          },
          {
              "text": "Week 8",
              "label": "Week 8",
              "startDate": "2022-10-16T07:00Z",
              "endDate": "2022-10-23T06:59Z",
              "seasonType": 2,
              "weekNumber": 8,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/8/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Oct 16 - 22"
          },
          {
              "text": "Week 9",
              "label": "Week 9",
              "startDate": "2022-10-23T07:00Z",
              "endDate": "2022-10-30T06:59Z",
              "seasonType": 2,
              "weekNumber": 9,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/9/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Oct 23 - 29"
          },
          {
              "text": "Week 10",
              "label": "Week 10",
              "startDate": "2022-10-30T07:00Z",
              "endDate": "2022-11-06T06:59Z",
              "seasonType": 2,
              "weekNumber": 10,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/10/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Oct 30 - Nov 5"
          },
          {
              "text": "Week 11",
              "label": "Week 11",
              "startDate": "2022-11-06T07:00Z",
              "endDate": "2022-11-13T07:59Z",
              "seasonType": 2,
              "weekNumber": 11,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/11/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Nov 6 - 12"
          },
          {
              "text": "Week 12",
              "label": "Week 12",
              "startDate": "2022-11-13T08:00Z",
              "endDate": "2022-11-20T07:59Z",
              "seasonType": 2,
              "weekNumber": 12,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/12/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Nov 13 - 19"
          },
          {
              "text": "Week 13",
              "label": "Week 13",
              "startDate": "2022-11-20T08:00Z",
              "endDate": "2022-11-27T07:59Z",
              "seasonType": 2,
              "weekNumber": 13,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/13/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Nov 20 - 26"
          },
          {
              "text": "Week 14",
              "label": "Week 14",
              "startDate": "2022-11-27T08:00Z",
              "endDate": "2022-12-04T07:59Z",
              "seasonType": 2,
              "weekNumber": 14,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/14/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Nov 27 - Dec 3"
          },
          {
              "text": "Week 15",
              "label": "Week 15",
              "startDate": "2022-12-04T08:00Z",
              "endDate": "2022-12-11T07:59Z",
              "seasonType": 2,
              "weekNumber": 15,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/15/year/2022/seasontype/2/group/80",
              "isActive": false,
              "dateRange": "Dec 4 - 10"
          },
          {
              "text": "Bowls",
              "label": "Bowls",
              "startDate": "2022-12-11T08:00Z",
              "endDate": "2023-01-11T07:59Z",
              "seasonType": 3,
              "weekNumber": 1,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/1/year/2022/seasontype/3/group/80",
              "isActive": false,
              "dateRange": "Dec 11 - Jan 10"
          },
          {
              "text": "All-Star",
              "label": "All-Star",
              "startDate": "2023-01-11T08:00Z",
              "endDate": "2023-07-01T06:59Z",
              "seasonType": 4,
              "weekNumber": 1,
              "year": 2022,
              "url": "/college-football/scoreboard/_/week/1/year/2022/seasontype/4/group/80",
              "isActive": false,
              "dateRange": "Jan 11 - Jun 30"
          }
      ],
      "seasonType": 2
  }

  let week = 1

  while (week < dates.weeks.length) {
      if (now < new Date(dates.weeks[week - 1].endDate) || week == dates.weeks.length - 1) {
          // return { season: 2020 ?? dates.year, week }
          return { season: 2020 ?? dates.year, week }
      }
      week++
  }
}

module.exports = { getCurrentWeek }