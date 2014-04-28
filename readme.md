#Address Checker

The purpose of this website is to enable the user to easily look up Blockchain info on any given bitcoin address.  Basically, a nicer looking http://blockexplorer.com/

##Dependencies

This site requires:

* Bootstrap - css and js.
* AngularJS
* jQuery (AngularJS also depends on jQuery)
* components.css - This is from an article from codrops that does the lookup button hover css ("Creative Buttons").  I've included it in the repository because it's tiny, but you'll likely not need it (the minimized code will be enough).

Otherwise it runs on a basic LAMP setup. 

Currently the only file not included here is an email handler in PHP, but that's because email has not yet been setup for this project.

##Roadmap

The site is to be presentable and polished by the 15th of May.  That includes:

* Verifying that displayed data is correct (currently it is caching old data and displaying both when a new search query is made).
* Implementing the 'transaction details' view, and the controller.
* Animations.  Need CSS animations for view transitions.
* Redesign?
* Work on the bottom section (info/contact us).
* Add Google Analytics
* Make the code production ready - minimize, etc.
* Deploy.

An ideal future feature is to allow the user to see graphs illustrating transactions (i.e. as clickable nodes on a chart, for more visual exploration).  Presumably d3.js will be used.

##Todo List
This differs from the roadmap in that it's generally more short term and technical.

* Fix 'Lookup' icon text going black after click.
* Add a minor hover effect on info icons to show interactivity (quarter turn hover then stop?)