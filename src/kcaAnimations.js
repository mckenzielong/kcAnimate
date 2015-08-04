(function () {
  angular.module('kcaAnimations', ['ngAnimate']);
  angular.module('kcaAnimations')
    .animation('.kca-page', KcaPage)
    .animation('.kca-list-fade', ListFade);

  var listOfInAnimationsFullPage = {
    "page-slide-in-from-top" : slideFromTop,
    "page-fade-in-up" : fadeInUp
  };

  var listOfInAnimations = {
    "slide-in-from-top" : slideFromTop,
    "fade-in-up" : fadeInUp(),
    "fade-in-up-10" : fadeInUp("10%"),
    "fade-in-up-20" : fadeInUp("20%"),
    "fade-in-up-30" : fadeInUp("30%"),
    "fade-in-up-40" : fadeInUp("40%"),
    "fade-in-up-50" : fadeInUp("50%"),
    "fade-in" : fadeInUp("0%")
  };

  var listOfOutAnimations = {
    "slide-out-top" : slideOutTop,
    "fade-out" : fadeOut,
    "scale-out" : scaleOut,
    "fade-out-down" : fadeOutDown
  };

  var TIMELINE_ATTR_IN = "kca-in-timeline";
  var TIMELINE_ATTR_OUT = "kca-out-timeline";
  var DEFAULT_DURATION = 0.6;
  var DEFAULT_DELAY = 0;

  KcaPage.$inject = ['$window', '$log', "$rootScope"];
  function KcaPage($window, $log, $rootScope) {
    var targetPageFrom = "*";
    var targetPageTo = "*";

    $rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParas) {
      targetPageFrom = "*";
      targetPageTo = "*";
      if (fromState && fromState.name) {
        targetPageFrom = fromState.name;
      }
      if (toState && toState.name) {
        targetPageTo = toState.name;
      }
      $log.debug(targetPageFrom, targetPageTo);
    });

    function createTimelineMarty(element, transitionIn) {
      var attributeName = transitionIn ? "kca-transition-in" : "kca-transition-out";
      var targetPage = transitionIn ? targetPageFrom : targetPageTo;
      var fullPageAnimations = transitionIn ? listOfInAnimationsFullPage : {};
      var elementAnimations = transitionIn ? listOfInAnimations : listOfOutAnimations;

      var pageTimeline = new TimelineLite({autoRemoveChildren: true, paused: true});
      var listOfElements = element[0].querySelectorAll("["+attributeName+"]");
      for (var i = 0; i < listOfElements.length; i++) {
        var definitions = listOfElements[i].getAttribute(attributeName)
          .replace(/\s/g, '').split(';');

        var name = null, props = null, defaultProps = null;
        //find the correct properties for our page
        for (var d = 0; d < definitions.length; d++) {
          var tempDef = definitions[d].split(':');
          name = null;
          props = null;
          if (tempDef.length > 1) {
            name = tempDef[0];
          }
          if (name) {
            //two cases to care about.  Either match or default.
            if (name === targetPage) {
              props = tempDef[1];
              break;
            } else if (name === "*") {
              defaultProps = tempDef[1];
            }
          }
        }

        //if nothing found try default
        props = props !== null ? props : defaultProps;

        //process the proeprties
        if (props && props.split) {
          var propArray = props.split(',');
          var transitionName = propArray[0];
          var delay = propArray[1] ? Number(propArray[1]) : DEFAULT_DELAY;
          var duration = propArray[2] ? Number(propArray[2]) : DEFAULT_DURATION;

          if (transitionName) {
            //if we are a full page transtion avoid everything else
            if (fullPageAnimations.hasOwnProperty(transitionName)) {
              pageTimeline.add(fullPageAnimations[transitionName](element[0], duration), delay);
              break;
            } else if (elementAnimations.hasOwnProperty(transitionName)) {
              pageTimeline.add(elementAnimations[transitionName](listOfElements[i], duration), delay);
            }
          }
        }
      }

      return pageTimeline;
    }

    return {
      enter: function (element, done) {
        var pageTimeline = createTimelineMarty(element, true);
        pageTimeline.eventCallback("onComplete", done);
        //wait for page out to finish...
        $rootScope.$on("$kcaTransitionOutComplete", function () {
          pageTimeline.restart(true, false);
          pageTimeline.play();
        });
      },
      leave: function (element, done) {
        var pageTimeline = createTimelineMarty(element, false);
        pageTimeline.eventCallback("onComplete", function () {
          $rootScope.$emit("$kcaTransitionOutComplete");
          done();
        });
        pageTimeline.restart(true, false);
        pageTimeline.play();
      }
    };
  }

  function slideFromTop(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        y:'-100%',
      },
      {
        y:'0%',
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function fadeInUp(amount) {
    return function (element, duration) {
      if (!amount) {
        amount = "0%";
      }
      var tween = TweenLite.fromTo(element, duration,
        {
          y: amount,
          opacity: 0,
        },
        {
          y:'0%',
          opacity: 1,
          ease: Power4.easeInOut,
        }
      );
      return tween;
    };
  }

  function fadeIn(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function slideOutTop(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        y:'0%',
      },
      {
        y:'-100%',
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function fadeOut(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        opacity: 1,
      },
      {
        opacity: 0,
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function scaleOut(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        scale: 1,
        opacity: 1
      },
      {
        scale: 2,
        opacity: 0,
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function fadeOutDown(element, duration) {
    var tween = TweenLite.fromTo(element, duration,
      {
        y:'0%',
        opacity: 1,
      },
      {
        y:'50%',
        opacity: 0,
        ease: Power4.easeInOut,
      }
    );
    return tween;
  }

  function ListFade($window) {
    return {
      enter: function (element, done) {
        tween = TweenLite.fromTo(element, DEFAULT_DURATION,
          {
            y:4,
            opacity: 0,
            maxHeight: '0',
          },
          {
            y:0,
            opacity: 1,
            maxHeight: element[0].clientHeight+'px',
            ease: Power4.easeInOut,
            onComplete: done
          }
        );
      },
      leave: function (element, done) {
        var cachedStyle = window.getComputedStyle(element[0]);
        var originalHeight = cachedStyle.height || cachedStyle.maxHeight;
        tween = TweenLite.fromTo(element, DEFAULT_DURATION,
          {
            y:0,
            opacity: 1,
            height: originalHeight,
            maxHeight: originalHeight
          },
          {
            opacity: 0,
            y:4,
            ease: Power4.easeInOut,
            height: '0',
            maxHeight: '0',
            onComplete: done
          }
        );
      },
      beforeAddClass: function(element, className, done) {
        if (className === 'ng-hide') {
          tween = TweenLite.fromTo(element, DEFAULT_DURATION,
            {
              y:0,
              opacity: 1,
              height: originalHeight,
              maxHeight: originalHeight
            },
            {
              opacity: 0,
              y:4,
              ease: Power4.easeInOut,
              height: '0',
              maxHeight: '0',
              onComplete: done
            }
          );
        }
      },
      removeClass: function(element, className, done) {
        if (className === 'ng-hide') {
          var cachedStyle = window.getComputedStyle(element[0]);
          var originalStyle = {
            marginTop: cachedStyle.marginTop,
            marginBottom: cachedStyle.marginBottom,
            paddingTop: cachedStyle.paddingTop,
            paddingBottom: cachedStyle.paddingBottom,
          };
          tween = TweenLite.fromTo(element, DEFAULT_DURATION,
            {
              y:4,
              opacity: 0,
              maxHeight: '0',
            },
            {
              y:0,
              opacity: 1,
              maxHeight: element[0].clientHeight+'px',
              ease: Power4.easeInOut,
              onComplete: done
            }
          );
        }
      }
    };
  }

})();
