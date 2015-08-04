# kcAnimate
Animates things.  Project in current form requires the use of [GSAP](http://greensock.com/docs/#/HTML5/GSAP/), and [ui-router](https://github.com/angular-ui/ui-router).  The basic idea was yoinked from [here](https://github.com/ThomasBurleson/angularjs-gsTimelines), but this implementation is clearly less thought-out / not implemented nearly as nice / doesn't do as much. 

### Usage
1. Include gsap, and ui-router as dependency, 'kcaAnimations' as a dependency
2. Add kca-page class to ui-view
3. Add `kca-transition-in|out="stateName|*:animation-name,delay,duration;"` to elements you wish to animate
 - Currently pages will only run sequentially (page-in animates after page out)
 - Use `'*'` as default
 - Set no animation for a certain state change by setting `state-name:;`

### Example
set the class on ui-view:
```html
  <div class="container-fluid kca-page" ui-view="page-container"></div>
```
In the view definition mark-up the html
```html
  <div class="row">
    <div class="col-xs-11 col-sm-offset-1">
      <h2 class="card-title" kca-transition-in="*:fade-in-up-20,0.3,0.8;">My Title</h2>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-12 col-sm-10 col-sm-offset-1 card-main"
      kca-transition-in="*:fade-in-up-10,0.6,0.8;">
      <h1>My Content</h1>
    </div>
  </div>
```
