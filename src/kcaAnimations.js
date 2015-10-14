(function () {
  "use strict";
  angular.module('kcaAnimations', ['ngAnimate']);
  angular.module('kcaAnimations')
    .animation('.kca-page', KcaPage)
    .animation('.kca-list-fade', ListFade)
    .animation('.kca-fade', RegularFade)
    .animation('.kca-scale', RegularScale);

  var PAGE_CLASS = "kca-page";
  var TRANSITION_IN_CLASS = "kca-in";

  KcaPage.$inject = ['$window', '$log', "$rootScope", "$kcaAnimations"];
  function KcaPage($window, $log, $rootScope, $kcaAnimations) {
    var targetPageFrom = "*";
    var targetPageTo = "*";

    $rootScope.$on("$viewContentLoading", function (e) {
      //console.log("VIEW CONTENT LAODING", e);
    });

    $rootScope.$on("$viewContentLoaded", function (e) {
      //console.log("VIEW CONTENT LOADED", e);
    });

    $rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParas) {
      //console.log("TRANISITION START");
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
      var attributeName = transitionIn ? $kcaAnimations.getTransitionInAttr() : $kcaAnimations.getTransitionOutAttr();
      var targetPage = transitionIn ? targetPageFrom : targetPageTo;
      //var fullPageAnimations = transitionIn ? listOfInAnimationsFullPage : {};

      var pageTimeline = new TimelineLite({autoRemoveChildren: true, paused: true, smoothChildTiming: true});
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
          var delay = propArray[1] ? Number(propArray[1]) : $kcaAnimations.getDelay();
          var duration = propArray[2] ? Number(propArray[2]) : $kcaAnimations.getDuration();

          if (transitionName) {
            //if we are a full page transtion avoid everything else
            var transitionFunction = $kcaAnimations.getTransition(transitionName);
            //TODO fullpage transitions...
            if (false) {
              //pageTimeline.add(fullPageAnimations[transitionName](element[0], duration), delay);
              break;
            }
            pageTimeline.add(transitionFunction(listOfElements[i], duration), delay);
          }
        }
      }
      return pageTimeline;
    }

    return {
      enter: function (element, done) {
        //console.log("REGISTER ENTER");
        element.addClass("kca-in");
        element.addClass("kca-waiting");
        var pageTimeline = createTimelineMarty(element, true);
        var removeListener;
        pageTimeline.eventCallback("onComplete", function () {
          if (removeListener) {
            removeListener();
          }
          //console.log("TRNASITION IN DONE");
          element.removeClass("kca-in");
          done();
        });
        //wait for page out to finish...
        removeListener = $rootScope.$on("$kcaTransitionOutComplete", function () {
          //console.log("TRNASITION OUT DONE");
          element.removeClass("kca-waiting");
          pageTimeline.restart(true, false);
          pageTimeline.play();
        });
        //console.log("IN READY");
      },
      leave: function (element, done) {
        //console.log("REGISTER LEAVE");
        element.addClass("kca-out");
        var pageTimeline = createTimelineMarty(element, false);
        pageTimeline.eventCallback("onComplete", function () {
          element.removeClass("kca-out");
          $rootScope.$emit("$kcaTransitionOutComplete");
          done();
        });
        pageTimeline.restart(true, false);
        pageTimeline.play();
        //console.log("OUT PLAYING");

        //$kcaAnimations.register(pageTimeline, false, done);
      }
    };
  }

  function RegularFade($window, $animateCss) {
    return {
      enter: function (element, done) {
        element.addClass("kca-in");
        tween = fadeInUp()(element, 0.5);
        tween.eventCallback("onComplete", function () {
          element.removeClass("kca-in");
          done();
        });
      },
      leave: function (element, done) {
        element.addClass("kca-out");
        tween = fadeOut(element, 0.5);
        tween.eventCallback("onComplete", function () {
          element.removeClass("kca-out");
          done();
        });
      },
      beforeAddClass: function(element, className, done) {
        element.addClass("kca-out");
        if (className === 'ng-hide') {
          tween = fadeOut(element, 0.5);
          tween.eventCallback("onComplete", function () {
            element.removeClass("kca-out");
            done();
          });
        }
      },
      removeClass: function(element, className, done) {
        element.addClass("kca-in");
        if (className === 'ng-hide') {
          tween = fadeInUp()(element, 0.5);
          tween.eventCallback("onComplete", function () {
            element.removeClass("kca-in");
            done();
          });
        }
      }
    };
  }

  function RegularScale($window, $animateCss) {
    return {
      enter: function (element, done) {
        element.addClass("kca-in");
        tween = scaleUpIn(element, 0.5);
        tween.eventCallback("onComplete", function () {
          element.removeClass("kca-in");
          done();
        });
      },
      leave: function (element, done) {
        element.addClass("kca-out");
        tween = scaleDownOut(element, 0.5);
        tween.eventCallback("onComplete", function () {
          element.removeClass("kca-out");
          done();
        });
      },
      beforeAddClass: function(element, className, done) {
        element.addClass("kca-out");
        if (className === 'ng-hide') {
          tween = scaleDownOut(element, 0.5);
          tween.eventCallback("onComplete", function () {
            element.removeClass("kca-out");
            done();
          });
        }
      },
      removeClass: function(element, className, done) {
        element.addClass("kca-in");
        if (className === 'ng-hide') {
          tween = scaleUpIn(element, 0.5);
          tween.eventCallback("onComplete", function () {
            element.removeClass("kca-in");
            done();
          });
        }
      }
    };
  }

  function ListFade($window, $animateCss) {
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
            ease: Expo.easeInOut,
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
            ease: Expo.easeInOut,
            height: '0',
            maxHeight: '0',
            onComplete: done
          }
        );
      },
      beforeAddClass: function(element, className, done) {
        if (className === 'ng-hide') {
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
              ease: Expo.easeInOut,
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
              ease: Expo.easeInOut,
              onComplete: done
            }
          );
        }
      }
    };
  }

})();

(function () {
  "use strict";
  angular.module('kcaAnimations')
    .provider("$kcaAnimations", [KcaAnimationsProvider]);

  function KcaAnimationsProvider() {
    var $log =  angular.injector(['ng']).get('$log');
    var fullPageTransitions = {
      "page-slide-in-from-top" : slideFromTop,
      "page-fade-in-up" : fadeInUp
    };

    var TRANSITION_IN_ATTR = "kca-transition-in";
    var TRANSITION_OUT_ATTR = "kca-transition-out";
    var DEFAULT_DURATION = 0.6;
    var DEFAULT_DELAY = 0;

    var transitions = {
      //IN
      "slide-in-from-top" : slideFromTop,
      "fade-in-up" : fadeInUp("10px"),
      "fade-in" : fadeInUp("0%"),
      "scale-in-up" : scaleUpIn,

      //OUT
      "slide-out-top" : slideOutTop,
      "fade-out" : fadeOutDown("0px"),
      "scale-out-up" : scaleUpOut,
      "scale-down" : scaleDownOut,
      "fade-out-down" : fadeOutDown("10px"),
    };

    for (var i = 5; i <= 50; i += 5) {
      registerTransition("fade-in-up-"+i, fadeInUp(i+"px"));
      registerTransition("fade-in-down-"+i, fadeInUp("-"+i+"px"));
      registerTransition("fade-out-down-"+i, fadeInUp(i+"px"));
      registerTransition("fade-out-up-"+i, fadeInUp("-"+i+"px"));
    }

    this.registerTransition = registerTransition;

    this.setTransitionInAttr = function (name) { TRANSITION_IN_ATTR = name; };
    this.setTransitionOutAttr = function (name) { TRANSITION_OUT_ATTR = name; };
    this.setDuration = function (time) { DEFAULT_DURATION = time; };
    this.setDelay = function (time) { DEFAULT_DELAY = time; };

    this.$get = function () {
      return {
        getFullPageTransition: getTransition(true),
        getTransition: getTransition(false),
        getTransitionInAttr: function () { return TRANSITION_IN_ATTR; },
        getTransitionOutAttr: function () { return TRANSITION_OUT_ATTR; },
        getDuration: function () { return DEFAULT_DURATION; },
        getDelay: function () { return DEFAULT_DELAY; },
      };
    };

    function registerTransition (transitionName, transitionFunction, isFullPage) {
      if (isFullPage) {
        if (fullPageTransitions.hasOwnProperty(transitionName)) {
          $log.warn("kcaAnimations: full page transition " + transitionName + " is overridding default");
        }
        fullPageTransitions[transitionName] = transitionFunction;
      } else {
        if (transitions.hasOwnProperty(transitionName)) {
          $log.warn("kcaAnimations: full page transition " + transitionName + " is overridding default");
        }
        transitions[transitionName] = transitionFunction;
      }
    }

    function getTransition (isFullPage) {
      return function (transitionName) {
        if (isFullPage && fullPageTransitions.hasOwnProperty(transitionName)) {
          return fullPageTransitions[transitionName];
        }
        if (transitions.hasOwnProperty(transitionName)) {
          return transitions[transitionName];
        }
        $log.warn("kcaAnimations: tranisition " + transitionName + " is not registered");
        return null;
      };
    }

    function slideFromTop(element, duration) {
      var tween = TweenLite.fromTo(element, duration,
        {
          y:'-100%',
        },
        {
          y:'0%',
          ease: Expo.easeInOut,
        }
      );
      return tween;
    }

    function fadeInUp(amount) {
      return function (element, duration) {
        if (!amount) {
          amount = "0px";
        }
        var tween = TweenLite.fromTo(element, duration,
          {
            y: amount,
            opacity: 0,
          },
          {
            y:'0px',
            opacity: 1,
            ease: Expo.easeInOut,
          }
        );
        return tween;
      };
    }

    function scaleUpIn(element, duration) {
      var tween = TweenLite.fromTo(element, duration,
        {
          scale: 0,
          rotation: 45
        },
        {
          scale: 1,
          rotation: 0,
          ease: Expo.easeInOut,
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
          ease: Expo.easeInOut,
        }
      );
      return tween;
    }

    function fadeOutDown (amount) {
      return function (element, duration) {
        if (!amount) {
          amount = "0px";
        }
        var tween = TweenLite.fromTo(element, duration,
          {
            opacity: 1,
            y:'0px'
          },
          {
            opacity: 0,
            y: amount,
            ease: Expo.easeInOut,
          }
        );
        return tween;
      };
  }

    function scaleUpOut(element, duration) {
      var tween = TweenLite.fromTo(element, duration,
        {
          scale: 1,
          opacity: 1
        },
        {
          scale: 2,
          opacity: 0,
          ease: Expo.easeInOut,
        }
      );
      return tween;
    }

    function scaleDownOut(element, duration) {
      var tween = TweenLite.fromTo(element, duration,
        {
          scale: 1,
          rotation: 0
        },
        {
          scale: 0,
          rotation: 45,
          ease: Expo.easeInOut,
        }
      );
      return tween;
    }
  }

})();
