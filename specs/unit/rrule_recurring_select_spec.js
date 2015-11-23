describe("ActivityChart Directive", function() {
  var scope, element, directiveScope, compile, httpBackend, rootScope;

  var scopedApp = angular.module('testApp', ['rruleRecurringSelect']);

  beforeEach(module('testApp'));
  beforeEach(module('rruleTemplates'));

  beforeEach(inject(function($rootScope, $compile, $httpBackend, $templateCache) {
    httpBackend = $httpBackend;
    rootScope = $rootScope;
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe("without a rule passed in", function() {
    beforeEach(function() {
      element = compile('<rrule_recurring_select></rrule_recurring_select>')(scope);
      scope.$digest();
      directiveScope = element.isolateScope();
    });

    describe("#init", function() {
      beforeEach(function() {
        directiveScope.selectedMonthFrequency = '';
        stub(directiveScope, '$watch');
        stub(directiveScope, 'resetData');
        stub(directiveScope, 'initFrequencies');
        stub(directiveScope, 'initWeekOrdinals');
        stub(directiveScope, 'parseRule');
        stub(directiveScope, 'calculateRRule');
        directiveScope.init();
      });

      it("sets up a watcher to determine if rule changed externally", function() {
        expect(directiveScope.$watch.calledWith(directiveScope.currentRule, directiveScope.ruleChanged)).to.be.true;
      });

      describe("no initial rule", function() {
        beforeEach(function() {
          directiveScope.parseRule.reset();
          directiveScope.calculateRRule.reset();
          directiveScope.rule = undefined;
          directiveScope.init();
        });

        it("does not call parse rule", function() {
          expect(directiveScope.parseRule.called).to.be.false;
        });

        it("calculates rrule", function() {
          expect(directiveScope.calculateRRule.called).to.be.true;
        });
      });

      describe("with initial rule", function() {
        beforeEach(function() {
          directiveScope.parseRule.reset();
          directiveScope.calculateRRule.reset();
          directiveScope.rule = 'FREQ=DAILY;INTERVAL=1;WKST=SU';
          directiveScope.init();
        });

        it("calls parse rule", function() {
          expect(directiveScope.parseRule.called).to.be.true;
        });

        it("does not try to calculate rrule", function() {
          expect(directiveScope.calculateRRule.called).to.be.false;
        });
      });

      it("resets the data", function() {
        expect(directiveScope.resetData.called).to.be.true;
      });

      it("sets the selected month frequency to day of month", function() {
        expect(directiveScope.selectedMonthFrequency).to.equal('day_of_month');
      });

      it("initializes the frequency options", function() {
        expect(directiveScope.initFrequencies.called).to.be.true;
      });

      it("initializes the week ordinals", function() {
        expect(directiveScope.initWeekOrdinals.called).to.be.true;
      });
    });

    describe("#initFrequencies", function() {
      beforeEach(function() {
        directiveScope.selectedFrequency = '';
        directiveScope.frequencies = [];
        directiveScope.initFrequencies();
      });

      it("sets up the frequencies", function() {
        expect(_.pluck(directiveScope.frequencies, 'name')).to.eql(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']);
      });

      it("sets the daily frequency as the default", function() {
        expect(directiveScope.selectedFrequency.name).to.equal('Daily');
      });
    });

    describe("#initMonthlyDays", function() {
      beforeEach(function() {
        directiveScope.monthDays = [];
        directiveScope.initMonthlyDays();
      });

      it("none are selected by default", function() {
        var noneSelected = _.all(directiveScope.monthDays, function(day) {
          return day.selected == false;
        });
        expect(noneSelected).to.be.true;
      });

      it("sets up the days", function() {
        expect(directiveScope.monthDays.length).to.eql(32);
      });

      it("includes the last day of month", function() {
        var last = _.last(directiveScope.monthDays);
        expect(last.day).to.eql('Last Day');
        expect(last.value).to.eql(-1);
      });
    });

    describe("#initMonthlyWeeklyDays", function() {
      beforeEach(function() {
        directiveScope.monthWeeklyDays = [];
        directiveScope.initMonthlyWeeklyDays();
      });

      it("it contains 4 weeks", function() {
        expect(directiveScope.monthWeeklyDays.length).to.equal(4);
      });

      it("each week contains 7 days", function() {
        var weeks = directiveScope.monthWeeklyDays;
        expect(_.all(weeks, function(week) {
          return week.length == 7;
        })).to.be.true;
      });

      it("sets up the first week's day values", function() {
        var firstWeek = directiveScope.monthWeeklyDays[0];
        var firstWeekValues = _.pluck(firstWeek, 'value');
        expect(firstWeekValues).to.eql([
          RRule.SU.nth(1),
          RRule.MO.nth(1),
          RRule.TU.nth(1),
          RRule.WE.nth(1),
          RRule.TH.nth(1),
          RRule.FR.nth(1),
          RRule.SA.nth(1)
        ]);
      });

      it("sets up the second week's day values", function() {
        var secondWeek = directiveScope.monthWeeklyDays[1];
        var secondWeekValues = _.pluck(secondWeek, 'value');
        expect(secondWeekValues).to.eql([
          RRule.SU.nth(2),
          RRule.MO.nth(2),
          RRule.TU.nth(2),
          RRule.WE.nth(2),
          RRule.TH.nth(2),
          RRule.FR.nth(2),
          RRule.SA.nth(2)
        ]);
      });

      it("sets up the third week's day values", function() {
        var thirdWeek = directiveScope.monthWeeklyDays[2];
        var thirdWeekValues = _.pluck(thirdWeek, 'value');
        expect(thirdWeekValues).to.eql([
          RRule.SU.nth(3),
          RRule.MO.nth(3),
          RRule.TU.nth(3),
          RRule.WE.nth(3),
          RRule.TH.nth(3),
          RRule.FR.nth(3),
          RRule.SA.nth(3)
        ]);
      });

      it("sets up the last week's day values", function() {
        var lastWeek = _.last(directiveScope.monthWeeklyDays);
        var lastWeekValues = _.pluck(lastWeek, 'value');
        expect(lastWeekValues).to.eql([
          RRule.SU.nth(4),
          RRule.MO.nth(4),
          RRule.TU.nth(4),
          RRule.WE.nth(4),
          RRule.TH.nth(4),
          RRule.FR.nth(4),
          RRule.SA.nth(4)
        ]);
      });
    });

    describe("#resetData", function() {
      beforeEach(function() {
        directiveScope.weekDays = 'qux';
        stub(directiveScope, 'daysOfWeek', 'foo');
        stub(directiveScope, 'initMonthlyDays');
        stub(directiveScope, 'initMonthlyWeeklyDays');
        directiveScope.resetData();
      });

      it("resets the days of the week", function() {
        expect(directiveScope.weekDays).to.eql('foo');
      });

      it("resets the monthly days", function() {
        expect(directiveScope.initMonthlyDays.called).to.be.true;
      });

      it("resets the monthly weekly days", function() {
        expect(directiveScope.initMonthlyWeeklyDays.called).to.be.true;
      });

      it("resets the interval", function() {
        expect(directiveScope.interval).to.eql('');
      });
    });

    describe("#toggleSelected", function() {
      var day = { name: 'S', value: RRule.SU, selected: false };

      beforeEach(function() {
        directiveScope.toggleSelected(day);
      });

      it("toggles the selected value of the day", function() {
        expect(day.selected).to.equal(true);
      });
    });

    describe("#calculateRRule", function() {
      var rule = new RRule({ freq: RRule.DAILY });

      beforeEach(function() {
        stub(directiveScope, 'calculateDailyRRule');
        directiveScope.selectedFrequency = { type: 'day' };
        directiveScope.recurrenceRule = rule;
        directiveScope.calculateRRule();
      });

      it("does not set the rule", function() {
        expect(directiveScope.rule).to.eql(undefined);
      });
    });
  });

  describe("with a rule passed in", function() {
    var ruleString = 'FREQ=YEARLY;INTERVAL=1';

    beforeEach(function() {
      scope.rule = ruleString;
      element = compile('<rrule_recurring_select rule="rule"></rrule_recurring_select>')(scope);
      scope.$digest();
      directiveScope = element.isolateScope();
    });

    describe("#init", function() {
      beforeEach(function() {
        stub(directiveScope, 'parseRule');
        stub(directiveScope, 'resetData');
        stub(directiveScope, 'initFrequencies');
        stub(directiveScope, 'initWeekOrdinals');
        directiveScope.rule = ruleString;
        directiveScope.init();
      });

      it("calls parse rule with the scope's rule", function() {
        expect(directiveScope.parseRule.calledWith(ruleString)).to.be.true;
      });
    });

    describe("#selectMonthFrequency", function() {
      beforeEach(function() {
        directiveScope.selectedMonthFrequency = 'day_of_week';
        stub(directiveScope, 'resetData');
        stub(directiveScope, 'calculateRRule');
        directiveScope.selectMonthFrequency('day_of_month');
      });

      it("sets the selectedMonthFrequency", function() {
        expect(directiveScope.selectedMonthFrequency).to.equal('day_of_month');
      });

      it("resets the data", function() {
        expect(directiveScope.resetData.called).to.be.true;
      });

      it("calculates the RRule", function() {
        expect(directiveScope.calculateRRule.called).to.be.true;
      });
    });

    describe("#calculateRRule", function() {
      beforeEach(function() {
        stub(directiveScope, 'calculateHourlyRRule');
        stub(directiveScope, 'calculateDailyRRule');
        stub(directiveScope, 'calculateWeeklyRRule');
        stub(directiveScope, 'calculateMonthlyRRule');
        stub(directiveScope, 'calculateYearlyRRule');
      });

      it("sets the rule even if the rule is an empty string", function() {
        var rule = new RRule({ freq: RRule.DAILY });
        directiveScope.rule = '';
        directiveScope.recurrenceRule = rule;
        directiveScope.calculateRRule();
        expect(directiveScope.rule).to.equal(rule.toString());
      });

      it("always sets the rule based on the calculated RRule", function() {
        var rule = new RRule({ freq: RRule.DAILY });
        directiveScope.recurrenceRule = rule;
        directiveScope.calculateRRule();
        expect(directiveScope.rule).to.equal(rule.toString());
      });

      describe("hourly", function() {
        beforeEach(function() {
          directiveScope.selectedFrequency = { type: 'hour' };
          directiveScope.calculateRRule();
        });

        it("calls the hourly calculation function", function() {
          expect(directiveScope.calculateHourlyRRule.called).to.be.true;
        });
      });


      describe("daily", function() {
        beforeEach(function() {
          directiveScope.selectedFrequency = { type: 'day' };
          directiveScope.calculateRRule();
        });

        it("calls the daily calculation function", function() {
          expect(directiveScope.calculateDailyRRule.called).to.be.true;
        });
      });

      describe("weekly", function() {
        beforeEach(function() {
          directiveScope.selectedFrequency = { type: 'week' };
          directiveScope.calculateRRule();
        });

        it("calls the weekly calculation function", function() {
          expect(directiveScope.calculateWeeklyRRule.called).to.be.true;
        });
      });

      describe("monthly", function() {
        beforeEach(function() {
          directiveScope.selectedFrequency = { type: 'month' };
          directiveScope.calculateRRule();
        });

        it("calls the monthly calculation function", function() {
          expect(directiveScope.calculateMonthlyRRule.called).to.be.true;
        });

        it("does not call the yearly calculation function", function() {
          expect(directiveScope.calculateYearlyRRule.called).to.be.false;
        });
      });

      describe("yearly", function() {
        beforeEach(function() {
          directiveScope.selectedFrequency = { type: 'year' };
          directiveScope.calculateRRule();
        });

        it("calls the yearly calculation function", function() {
          expect(directiveScope.calculateYearlyRRule.called).to.be.true;
        });
      });
    });

    describe("#calculateInterval", function() {
      var interval;

      describe("null", function() {
        beforeEach(function() {
          directiveScope.interval = null;
          interval = directiveScope.calculateInterval();
        });

        it("should be 1", function() {
          expect(interval).to.eql(1);
        });
      });

      describe("undefined", function() {
        beforeEach(function() {
          directiveScope.interval = undefined;
          interval = directiveScope.calculateInterval();
        });

        it("should be 1", function() {
          expect(interval).to.eql(1);
        });
      });

      describe("empty", function() {
        beforeEach(function() {
          directiveScope.interval = '';
          interval = directiveScope.calculateInterval();
        });

        it("should be 1", function() {
          expect(interval).to.eql(1);
        });
      });

      describe("> 1", function() {
        beforeEach(function() {
          directiveScope.interval = 2;
          interval = directiveScope.calculateInterval();
        });

        it("should be 2", function() {
          expect(interval).to.eql(2);
        });
      });
    });

    describe("#calculateHourlyRRule", function() {

      describe("every hour", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = '';
          directiveScope.calculateHourlyRRule();
        });

        it("has the correct iCal string from RRule", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=HOURLY;INTERVAL=1;WKST=SU');
        });
      });

      describe("every 2 hours", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = 2;
          directiveScope.calculateHourlyRRule();
        });

        it("has the correct iCal string from RRule", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=HOURLY;INTERVAL=2;WKST=SU');
        });
      });

    });


    describe("#calculateDailyRRule", function() {

      describe("every day", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = '';
          directiveScope.calculateDailyRRule();
        });

        it("can grab text description from RRule", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every day');
        });


        it("has the correct iCal string from RRule", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=DAILY;INTERVAL=1;WKST=SU');
        });
      });

      describe("every 2 days", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = 2;
          directiveScope.calculateDailyRRule();
        });

        it("can grab text description from RRule", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every 2 days');
        });

        it("has the correct iCal string from RRule", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=DAILY;INTERVAL=2;WKST=SU');
        });
      });

      describe("every day at 10am and 5pm", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = 1;
          directiveScope.hours[10].selected = true;
          directiveScope.hours[17].selected = true;
          directiveScope.calculateDailyRRule();
        });

        it("has the correct iCal string from RRule", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=DAILY;INTERVAL=1;BYHOUR=10,17;WKST=SU');
        });
      });

    });

    describe("#calculateWeeklyRRule", function() {
      beforeEach(function() {
        directiveScope.weekDays = directiveScope.daysOfWeek();
        directiveScope.interval = 1;
      });

      describe("every week with no date selected", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.calculateWeeklyRRule();
        });

        it("occurs every week on week start (sunday)", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every week');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=WEEKLY;INTERVAL=1;WKST=SU');
        });
      });

      describe("every week on monday", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.weekDays[1].selected = true;
          directiveScope.calculateWeeklyRRule();
        });

        it("occurs every week on Monday", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every week on Monday');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=MO');
        });
      });

      describe("every week on monday and thursday", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.weekDays[1].selected = true;
          directiveScope.weekDays[4].selected = true;
          directiveScope.calculateWeeklyRRule();
        });

        it("occurs every week on Monday and Thursday", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every week on Monday, Thursday');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=MO,TH');
        });
      });

      describe("every 2 weeks on wednesday", function() {
        beforeEach(function() {
          directiveScope.recurrenceRule = undefined;
          directiveScope.interval = 2;
          directiveScope.weekDays[3].selected = true;
          directiveScope.calculateWeeklyRRule();
        });

        it("occurs every 2 weeks on Wednesday", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every 2 weeks on Wednesday');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=WEEKLY;INTERVAL=2;WKST=SU;BYDAY=WE');
        });
      });
    });

    describe("#calculateMonthlyRRule", function() {
      beforeEach(function() {
        directiveScope.selectedFrequency = 'month';
        stub(directiveScope, 'calculateDayOfMonthRRule');
        stub(directiveScope, 'calculateDayOfWeekRRule');
      });

      describe("day of month", function() {
        beforeEach(function() {
          directiveScope.selectedMonthFrequency = 'day_of_month';
          directiveScope.calculateMonthlyRRule();
        });

        it("calls day of month rrule function", function() {
          expect(directiveScope.calculateDayOfMonthRRule.called).to.be.true;
          expect(directiveScope.calculateDayOfWeekRRule.called).to.be.false;
        });
      });

      describe("day of week", function() {
        beforeEach(function() {
          directiveScope.selectedMonthFrequency = 'day_of_week';
          directiveScope.calculateMonthlyRRule();
        });

        it("calls day of week rrule function", function() {
          expect(directiveScope.calculateDayOfWeekRRule.called).to.be.true;
          expect(directiveScope.calculateDayOfMonthRRule.called).to.be.false;
        });
      });
    });

    describe("#calculateDayOfMonthRRule", function() {
      beforeEach(function() {
        directiveScope.recurrenceRule = undefined;
        directiveScope.interval = '';
        directiveScope.initMonthlyDays();
      });

      describe("every month on the third, tenth and twenty-first", function() {
        beforeEach(function() {
          directiveScope.monthDays[2].selected = true;
          directiveScope.monthDays[9].selected = true;
          directiveScope.monthDays[20].selected = true;
          directiveScope.calculateDayOfMonthRRule();
        });

        it("has the correct text", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every month on the 10th, 21st and 3rd');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYMONTHDAY=3,10,21');
        });
      });

      describe("every month on the last day", function() {
        beforeEach(function() {
          directiveScope.monthDays[31].selected = true;
          directiveScope.calculateDayOfMonthRRule();
        });

        it("has the correct text", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every month on the last');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYMONTHDAY=-1');
        });
      });

      describe("every three months on the first and last day of the month", function() {
        beforeEach(function() {
          directiveScope.interval = 3;
          directiveScope.monthDays[0].selected = true;
          directiveScope.monthDays[31].selected = true;
          directiveScope.calculateDayOfMonthRRule();
        });

        it("has the correct text", function() {
          expect(directiveScope.recurrenceRule.toText()).to.eql('every 3 months on the 1st and last');
        });

        it("has the correct iCal string", function() {
          expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=3;WKST=SU;BYMONTHDAY=1,-1');
        });
      });
    });

    describe("#calculateDayOfWeekRRule", function() {
      beforeEach(function() {
        directiveScope.recurrenceRule = undefined;
        directiveScope.interval = '';
        directiveScope.initMonthlyWeeklyDays();
      });

      describe("every month", function() {
        beforeEach(function() {
          directiveScope.interval = 1;
        });

        describe("on the 2nd and 4th tuesday", function() {
          beforeEach(function() {
            directiveScope.monthWeeklyDays[1][2].selected = true;
            directiveScope.monthWeeklyDays[3][2].selected = true;
            directiveScope.calculateDayOfWeekRRule();
          });

          it("has the correct text", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every month on the 2nd Tuesday and 4th Tuesday');
          });

          it("has the correct iCal string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYDAY=+2TU,+4TU');
          });
        });

        describe("on the 1st sunday and the 2nd tuesday", function() {
          beforeEach(function() {
            directiveScope.monthWeeklyDays[0][0].selected = true;
            directiveScope.monthWeeklyDays[1][2].selected = true;
            directiveScope.calculateDayOfWeekRRule();
          });

          it("has the correct text", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every month on the 2nd Tuesday and 1st Sunday');
          });

          it("has the correct iCal string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYDAY=+1SU,+2TU');
          });
        });
      });

      describe("every 2 months", function() {
        beforeEach(function() {
          directiveScope.interval = 2;
        });

        describe("on the 2nd and 4th monday", function() {
          beforeEach(function() {
            directiveScope.monthWeeklyDays[1][1].selected = true;
            directiveScope.monthWeeklyDays[3][1].selected = true;
            directiveScope.calculateDayOfWeekRRule();
          });

          it("has the correct text", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every 2 months on the 2nd Monday and 4th Monday');
          });

          it("has the correct iCal string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=MONTHLY;INTERVAL=2;WKST=SU;BYDAY=+2MO,+4MO');
          });
        });
      });
    });

    describe("#calculateYearlyRRule", function() {
      describe("every year", function() {
        describe("on one month and day", function() {
          beforeEach(function() {
            directiveScope.recurrenceRule = undefined;
            directiveScope.interval = '';
            directiveScope.yearMonths[7].selected = true;
            directiveScope.monthDays[24].selected = true;
            directiveScope.calculateYearlyRRule();
          });

          it("can grab text description from RRule", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every August on the 25th');
          });

          it("has the correct iCal string from RRule", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=YEARLY;INTERVAL=1;BYMONTH=8;BYMONTHDAY=25');
          });
        });

        describe("multiple months and days", function() {
          beforeEach(function() {
            directiveScope.recurrenceRule = undefined;
            directiveScope.interval = '';
            directiveScope.yearMonths[4].selected = true;
            directiveScope.yearMonths[7].selected = true;
            directiveScope.monthDays[6].selected = true;
            directiveScope.monthDays[24].selected = true;

            directiveScope.calculateYearlyRRule();
          });

          it("can grab text description from RRule", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every May and August on the 25th and 7th');
          });

          it("has the correct iCal string from RRule", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=YEARLY;INTERVAL=1;BYMONTH=5,8;BYMONTHDAY=7,25');
          });
        });
      });

      describe("every 2 years", function() {
        describe("on one month and day", function() {
          beforeEach(function() {
            directiveScope.recurrenceRule = undefined;
            directiveScope.interval = 2;
            directiveScope.yearMonths[7].selected = true;
            directiveScope.monthDays[24].selected = true;
            directiveScope.calculateYearlyRRule();
          });

          it("can grab text description from RRule", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every 2 years August on the 25th');
          });

          it("has the correct iCal string from RRule", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=YEARLY;INTERVAL=2;BYMONTH=8;BYMONTHDAY=25');
          });
        });

        describe("multiple months and days", function() {
          beforeEach(function() {
            directiveScope.recurrenceRule = undefined;
            directiveScope.interval = 2;
            directiveScope.yearMonths[4].selected = true;
            directiveScope.yearMonths[7].selected = true;
            directiveScope.monthDays[6].selected = true;
            directiveScope.monthDays[24].selected = true;

            directiveScope.calculateYearlyRRule();
          });

          it("can grab text description from RRule", function() {
            expect(directiveScope.recurrenceRule.toText()).to.eql('every 2 years May and August on the 25th and 7th');
          });

          it("has the correct iCal string from RRule", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql('FREQ=YEARLY;INTERVAL=2;BYMONTH=5,8;BYMONTHDAY=7,25');
          });
        });
      });
    });

    describe("#parseRule", function() {
      beforeEach(function() {
        directiveScope.resetData();
        directiveScope.recurrenceRule = undefined;

      });

      describe("hourly", function() {
        describe("every hour", function() {
          var iCalString = 'FREQ=HOURLY;INTERVAL=1;WKST=SU';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to 'hourly'", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('hour');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every 2 hours", function() {
          var iCalString = 'FREQ=HOURLY;INTERVAL=2;WKST=SU';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to 'hourly'", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('hour');
          });

          it("sets the interval to 2", function() {
            expect(directiveScope.interval).to.eql(2);
          });
        });
      });


      describe("daily", function() {
        describe("every day", function() {
          var iCalString = 'FREQ=DAILY;INTERVAL=1;WKST=SU';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to 'daily'", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('day');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every 2 days", function() {
          var iCalString = 'FREQ=DAILY;INTERVAL=2;WKST=SU';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to 'daily'", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('day');
          });

          it("sets the interval to 2", function() {
            expect(directiveScope.interval).to.eql(2);
          });
        });

        describe("every 10:00 and 17:00", function() {
          var iCalString = 'FREQ=DAILY;INTERVAL=1;WKST=SU;BYHOUR=10,17';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to 'daily'", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('day');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });

          it("sets selected to true for 10 & 17", function() {
            expect(directiveScope.hours[10].selected).to.be.true;
            expect(directiveScope.hours[17].selected).to.be.true;
          });

          it("does not selected to true for hours other than 10 and 17", function() {
            for (var i=0; i< 24; i++) {
              if (i !== 10 && i !== 17) {
                expect(directiveScope.hours[i].selected).to.be.false;
              }
            }
          });

        });

      });

      describe("weekly", function() {
        describe("every week on sunday", function() {
          var iCalString = 'FREQ=WEEKLY;INTERVAL=1;WKST=SU';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selected frequency to weekly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('week');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every week on monday", function() {
          var iCalString = 'FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=MO';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets selected to true for monday", function() {
            expect(directiveScope.weekDays[1].selected).to.be.true;
          });

          it("does not selected to true for days other than monday", function() {
            _.each([0, 2, 3, 4, 5, 6], function(weekDayIndex) {
              expect(directiveScope.weekDays[weekDayIndex].selected).to.be.false;
            });
          });

          it("sets the selected frequency to weekly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('week');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every week on monday and thursday", function() {
          var iCalString = 'FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=MO,TH';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets selected to true for monday and thursday", function() {
            expect(directiveScope.weekDays[1].selected).to.be.true;
            expect(directiveScope.weekDays[4].selected).to.be.true;
          });

          it("does not selected to true for days other than monday & thursday", function() {
            _.each([0, 2, 3, 5, 6], function(weekDayIndex) {
              expect(directiveScope.weekDays[weekDayIndex].selected).to.be.false;
            });
          });

          it("sets the selectedFrequency to weekly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('week');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every 2 weeks on wednesday", function() {
          var iCalString = 'FREQ=WEEKLY;INTERVAL=2;WKST=SU;BYDAY=WE';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets selected to true for wednesday", function() {
            expect(directiveScope.weekDays[3].selected).to.be.true;
          });

          it("does not set selected to true for days other than wednesday", function() {
            _.each([0, 1, 2, 4, 5, 6], function(weekDayIndex) {
              expect(directiveScope.weekDays[weekDayIndex].selected).to.be.false;
            });
          });

          it("sets the selectedFrequency to weekly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('week');
          });

          it("sets the interval to 2", function() {
            expect(directiveScope.interval).to.eql(2);
          });
        });
      });

      describe("monthly", function() {
        beforeEach(function() {
          directiveScope.selectedMonthFrequency = '';
        });

        describe("day of month", function() {
          describe("every month on the third, tenth and twenty-first", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYMONTHDAY=3,10,21';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 1", function() {
              expect(directiveScope.interval).to.eql(1);
            });

            it("selects only the 3rd, 10th, and 21st of the month", function() {
              _.each([2, 9, 20], function(index) {
                expect(directiveScope.monthDays[index].selected).to.be.true;
              });
            });

            it("sets the selected month frequency", function() {
              expect(directiveScope.selectedMonthFrequency).to.equal('day_of_month');
            });

            it("does not select any other days", function() {
              var selectedKeys = [2, 9, 20];

              _.keys(directiveScope.monthDays, function(key) {
                if (_.contains(selectedKeys, key))
                  return;

                expect(directiveScope.monthDays[key].selected).to.be.false;
              });
            });
          });

          describe("every month on the last day", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYMONTHDAY=-1';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 1", function() {
              expect(directiveScope.interval).to.eql(1);
            });

            it("selects only the last day of the month", function() {
              expect(directiveScope.monthDays[31].selected).to.be.true;
            });

            it("does not select any other days", function() {
              var selectedKeys = [31];

              _.keys(directiveScope.monthDays, function(key) {
                if (_.contains(selectedKeys, key))
                  return;

                expect(directiveScope.monthDays[key].selected).to.be.false;
              });
            });
          });

          describe("every three months on the first and last day of the month", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=3;WKST=SU;BYMONTHDAY=1,-1';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 3", function() {
              expect(directiveScope.interval).to.eql(3);
            });

            it("selects only the first and last days of the month", function() {
              expect(directiveScope.monthDays[0].selected).to.be.true;
              expect(directiveScope.monthDays[31].selected).to.be.true;
            });

            it("does not select any other days", function() {
              var selectedKeys = [0, 31];

              _.keys(directiveScope.monthDays, function(key) {
                if (_.contains(selectedKeys, key))
                  return;

                expect(directiveScope.monthDays[key].selected).to.be.false;
              });
            });
          });
        });

        describe("day of week", function() {
          describe("every month on the 2nd and 4th Tuesdays", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYDAY=+2TU,+4TU';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 1", function() {
              expect(directiveScope.interval).to.eql(1);
            });

            it("selects only the 2nd and 4th tuesday", function() {
              expect(directiveScope.monthWeeklyDays[1][2].selected).to.be.true;
              expect(directiveScope.monthWeeklyDays[3][2].selected).to.be.true;
            });

            it("sets the selected month frequency", function() {
              expect(directiveScope.selectedMonthFrequency).to.equal('day_of_week');
            });
          });

          describe("every month on the 1st sunday and the 2nd tuesday", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=1;WKST=SU;BYDAY=+1SU,+2TU';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 1", function() {
              expect(directiveScope.interval).to.eql(1);
            });

            it("selects only the 1st sunday and 2nd tuesday", function() {
              expect(directiveScope.monthWeeklyDays[0][0].selected).to.be.true;
              expect(directiveScope.monthWeeklyDays[1][2].selected).to.be.true;
            });
          });

          describe("every 2 months on the 2nd and 4th monday", function() {
            var iCalString = 'FREQ=MONTHLY;INTERVAL=2;WKST=SU;BYDAY=+2MO,+4MO';

            beforeEach(function() {
              directiveScope.parseRule(iCalString);
            });

            it("sets the recurrenceRule from the ical string", function() {
              expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
            });

            it("sets the selectedFrequency to monthly", function() {
              expect(directiveScope.selectedFrequency.type).to.eql('month');
            });

            it("sets the interval to 2", function() {
              expect(directiveScope.interval).to.eql(2);
            });

            it("selects only the 2nd and 4th monday", function() {
              expect(directiveScope.monthWeeklyDays[1][1].selected).to.be.true;
              expect(directiveScope.monthWeeklyDays[3][1].selected).to.be.true;
            });
          });
        });
      });

      describe("yearly", function() {
        describe("every year", function() {
          var iCalString = 'FREQ=YEARLY;INTERVAL=1;BYYEARDAY=1';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to yearly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('year');
          });

          it("sets the interval to 1", function() {
            expect(directiveScope.interval).to.eql(1);
          });
        });

        describe("every 2 years", function() {
          var iCalString = 'FREQ=YEARLY;INTERVAL=2;BYYEARDAY=1';

          beforeEach(function() {
            directiveScope.parseRule(iCalString);
          });

          it("sets the recurrenceRule from the ical string", function() {
            expect(directiveScope.recurrenceRule.toString()).to.eql(iCalString)
          });

          it("sets the selectedFrequency to yearly", function() {
            expect(directiveScope.selectedFrequency.type).to.eql('year');
          });

          it("sets the interval to 2", function() {
            expect(directiveScope.interval).to.eql(2);
          });
        });
      });
    });

    describe("#ruleChanged", function() {
      describe("with rule", function() {
        beforeEach(function() {
          directiveScope.rule = 'FREQ=YEARLY;INTERVAL=2;BYYEARDAY=1';
          stub(directiveScope, 'parseRule');
          directiveScope.ruleChanged();
        });

        it("parses the rule", function() {
          expect(directiveScope.parseRule.called).to.be.true;
        });
      });

      describe("without rule", function() {
        beforeEach(function() {
          directiveScope.rule = '';
          stub(directiveScope, 'parseRule');
          directiveScope.ruleChanged();
        });

        it("does not parse the rule", function() {
          expect(directiveScope.parseRule.called).to.be.false;
        });
      });
    });

    describe("#currentRule", function() {
      var rule = 'FREQ=YEARLY;INTERVAL=2;BYYEARDAY=1';

      it("returns the current scope rule", function() {
        directiveScope.rule = rule;
        expect(directiveScope.currentRule()).to.eql(rule);
      });
    });
  });
});

