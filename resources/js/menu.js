/**
 * t29v7 Menu
 *
 * Features from t29v6:
 *  - Collapsable (can be expanded by button)
 *  - Scrollable (can be maked position:fixed by button)
 *  - Guide beam (footer clone of navigation in a fancy beam like way)
 *
 * Language-specific strings are taken from msg.
 *
 * (c) 2012 Sven Koeppel <sven@tech..29.de>
 * Licensed under GPL
 **/


// Adapter to mediawiki messages. See skin.json for getting the message to
// the client and i18n/*.json for the messages. See also
// https://www.mediawiki.org/wiki/Manual:Messages_API#Using_messages_in_JavaScript
// for details.
var getmsg = (m) => mw.message(m).plain(); // or .text()

// Adapter to user settings.
// See https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.user
// and https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Map
var prefs = mw.user.options; /* has get() and set() */
// To expose user settings in Special:Preferences, see
// https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences

menu = { collapsed:{}, scroll:{}, guide:{} }; // mit Unterklassen
menu.setup = function() {
	menu.side = $("nav.side");   // Hauptseitennavigation
	menu.beam = $("nav.guide");  // Strahlnavigation/Guide (Kopie von side)
	menu.rel = $("nav.rel");     // relative navigation im footer (vor/zurück)
	
	if(menu.side.hasClass("contains-menu")) {
		menu.collapsed.setup();
		menu.scroll.setup();
	} // else: hasClass("contains-custom") -> keine Navigation
	
	// t29v6 launch: Guide-Menü erst mal deaktiviert
	//menu.guide.setup();
};

/***************************************************************************************
  1. Collapsable Menu system  menu.collapsed
  
     The collapsable menu system is capable of collapse parts of the menu by user
     interaction or program request. The current state is stored in prefs.

***************************************************************************************/

/**
 * Construct a new collapsible. It needs three named arguments:
 *   c = new menu.Collapsible({
 *       id: 'foobar',  // a senseful id for the prefs cookie system
 *       lists: $(".your ul"),  // some element which should be collapsed
 *       button: $("<button/>").appendTo("body"); // some button which should do the work
 *   });
 *
 **/
menu.Collapsible = function(arglist) {
	for (var n in arguments[0]) { this[n] = arguments[0][n]; }
	this.store_key = 'menu-collapsible-'+this.id; // key for prefs.get/set

	// default values
	if(!this.button) // button widget
		this.button_box = $('<li class="button-box"></li>'); // in nav.side
		this.button_box.prependTo("nav.side li:has(span.collapsible-button-before)");
	
		this.button = $('<span class="button collapse-menu"></span>')
		              .addClass('for-'+this.id).//appendTo("nav.side");
					                            appendTo(this.button_box);	
					  
    if(!this.label) { // button label
		this.label = {};
		this.label[t29c.FOLD] = getmsg("js-menu-collapse-out");
		this.label[t29c.EXPAND] = getmsg("js-menu-collapse-in");
	}
	if(!this.initial) // initial state
		this.initial = prefs.get(this.store_key, t29c.FOLD);

	// set initial state
	this.set(this.initial, t29c.QUICK);
	
	// set button callback
	this.button.click($.proxy(function(){ this.set(); }, this));
}

// Constants:
if(!window.t29c) window.t29c = {}; // namespace for t29 contstants
t29c.FOLD = true; // state: folded menu (small)
t29c.EXPAND = false; // state: expanded menu (big)
t29c.QUICK = true; // action: quick crossover (no animation, instantanous)
t29c.ANIMATE = false; // action: animated crossover (visible to user)

/**
 * Menu ein- oder ausklappen.
 * 
 * @param target_state  true: Eingeklappt, false: ausgeklappt
 * @param quick  true=keine Animation, false/undefined=Animation
 **/
menu.Collapsible.prototype.set = function(collapse, quick) {
	if(collapse == undefined)
		collapse = ! this.is_collapsed();
	console.log("Collapse: "+this.id+" FOLD " +(collapse==t29c.FOLD ? "<=" : "=>")+" EXPAND " + (quick==t29c.QUICK ? "[quick!]" : ""));
	if(this.set_pre)
		this.set_pre(collapse, quick); // execute some callback
	if(quick) this.lists[collapse ? 'hide' : 'show']();
	else      this.lists[collapse ? 'slideUp' : 'slideDown']();
	this.button.text(this.label[collapse]);
	// body CSS class shall only be used for CSS interaction, not for JS readout. Use is_collapsed() instead.
	$("body")[collapse ? 'addClass' : 'removeClass']("collapsed-menu-"+this.id);
	prefs.set(this.store_key, collapse);
}

// returns whether menu is collapsed (boolean).
menu.Collapsible.prototype.is_collapsed = function() { return prefs.get(this.store_key) == t29c.FOLD; }

menu.collapsed.setup = function() {
	// set up some collapsible lists
	menu.collapsed.u3 = new menu.Collapsible({
		id: 'u3',
        // Note that .u3 is gone, so use ul ul ul instead
		lists: $("nav.side ul ul ul").not("nav.side li.active > ul"), //, .geraete"),
	});
	
	// check if we want mini menu for the beginning
	if( $("body").hasClass("in-geraete") ) {
		menu.collapsed.u3.button.hide();
		// mini doesn't care about cookie settings.
		menu.collapsed.mini = new menu.Collapsible({
			id: 'mini',
            // FIXME selectors ul.u3
			lists: $("nav.side li").not('.guide-only').not("li.active, li.active > ul.u3 > li, li.active > ul.u4 > li"),
			initial: t29c.FOLD,
			set_pre: function(collapse) {
				if(collapse == t29c.EXPAND) {
					// after first expanding, disable system and enable rest of systems
					this.button.hide();
					menu.collapsed.u3.button.show();
				}
			}
		});
	}
	
	/*
	menu.collapsed.geraete = new menu.Collapsible({
		id: 'geraete',
		lists: $("nav.side ul.geraete"),
		label: (function(){ l = {}; l[t29c.FOLD] = '(+ extra)';  l[t29c.EXPAND] = '(- extra)'; return l; })(),
	});
	*/

	// special situation on gerate pages (body.in-geraete): only active li's are shown there
	// by default. This is a third state next to FOLDed and EXPANDed menu: super-FOLDED.
	// Clicking the 'details' button yields ordinary FOLDed state.
	
	// hide geraete
	//menu.collapsed.geraete.button.hide();
	//$("ul.geraete").hide();
};

/***************************************************************************************
  2. Menu scroll system  menu.scroll
  
     The scrollable menu system can handle a position:fixed navigation area with dynamic
     switching to static or absolute positioning. It is narrowly toothed to the
     collapse system. Current state is stored in prefs.

***************************************************************************************/

// enums, die CSS-Klassen im <html> entsprechen:
menu.scroll.States = Object.freeze({STATIC:"static-menu",FIX:"fixed-menu",STICK_TOP:"stick-top-menu",STICK_BOTTOM:"stick-bottom-menu"});
/**
 * Menuezustand beim Scrollen umschalten.
 * @param target_state Zustand aus scroll.States-Enum
 * @param 
 *
 **/
menu.scroll.set = function(target_state) {
	old_state = menu.scroll.state;
	menu.scroll.state = target_state;
	$("html").removeClass("static-menu fixed-menu stick-top-menu stick-bottom-menu").addClass(menu.scroll.state);
	
	// Aufraeumen nach altem Status:
	switch(old_state) {
		case menu.scroll.States.STICK_BOTTOM:
			menu.side.attr("style",""); // reset css "top" value for positioning
			break;
	}
	
	// Einrichten des neuen Status:
	console.log("Gehe in Scroll-Zustand "+target_state);
	switch(target_state) {
		case menu.scroll.States.STICK_TOP:
			// Menue schlaegt obene an. Prinzipiell Gleicher Zustand wie STATIC. Weiter.
		case menu.scroll.States.STATIC:
			// die CSS-Klassen regeln eigentlich alles.
			//CSS// menu.collapsed.u3.button.show();
			menu.scroll.but.text(getmsg("js-menu-scroll-show"));
			menu.side.show();
			break;
		case menu.scroll.States.FIX:
			// checken ob fixing ueberhaupt geht
			/*
			if( !menu.collapsed.is() && menu.side.height() > $(window).height()) {
				// Navi ist gerade ausgeklappt und zu groß fuer Bildschirm. Probiere Einklappen:
				menu.collapsed.set(true, true);
				if(menu.side.height() > $(window).height()) {
					// Navi ist auch eingeklappt noch zu groß!
					console.log("Navi ist auch eingeklappt zu groß zum fixen!");
					// eingeklappt lassen. Weitermachen.
					// hier noch was ueberlegen: Bei zu kleinem Bildschirm
					// sollte der Button gar nicht erst angezeigt werden.
					// dazu braucht man einen resize-Listener, der aber im
					// ausgeklappten zustand jedesmal checken müsste, ob das
					// eingeklappte menue reinpasst. (werte muss man cachen)
					// Ziemlich doofe Aufgabe.
				}
			}*/

			menu.collapsed.u3.set(true, true); // Sicherstellen, dass Navi eingeklappt.
			//CSS// menu.collapsed.u3.button.hide(); // Ausgeklappte Navi passt auf keinen Bildschirm.
			menu.scroll.but.text(getmsg("js-menu-scroll-hide"));
			break;
		case menu.scroll.States.STICK_BOTTOM:
			// Position absolute; Top-Position manuell setzen.
			menu.side.css({top: menu.scroll.stick_bottom });
			break;
		default:
			console.log("Schlechter Zustand: "+target_state);
	}
}

menu.scroll.setup = function() {
	menu.scroll.but = $('<span class="button get-menu"></span>').appendTo("section.sidebar");

	/**
	 * prefs and menu.scroll: Valid values are only FIX and STATIC.
	 * Crossover states like STICK_BOTTOM, STICK_TOP shall not be stored.
	 **/
	menu.scroll.store_key = 'menu-scroll'; // key for accessing prefs value
	
	// set initial state:
	initial = prefs.get(menu.scroll.store_key, menu.scroll.States.STATIC);
	switch(initial) {
		case menu.scroll.States.STATIC:
			menu.scroll.set(initial);
			break;
		case menu.scroll.States.FIX:
			// davon ausgehend, dass wir uns ganz oben befinden beim Seiten-Laden.
			// TODO / PENDING: Wenn man mit Anker #foobar auf die Seite reinkommt,
			//                 ist das nicht der Fall! Das kann kombiniert werden
			//                 mit smoothscroll!
			menu.scroll.set(menu.scroll.States.STICK_TOP);
			break;
		default:
			console.log("menu.scroll.setup: Invalid value "+initial+" for initial prefs");
	}
	
	menu.scroll.but.click(function(){
		switch(menu.scroll.state) {
			case menu.scroll.States.STATIC:
				// zu Fix uebergehen, mit Animation.
				menu.side.hide();
				menu.scroll.set(menu.scroll.States.FIX);
				menu.side.fadeIn();
				prefs.set(menu.scroll.store_key, menu.scroll.States.FIX);
				break;
			case menu.scroll.States.FIX:
			case menu.scroll.States.STICK_BOTTOM:
				// zu Static uebergehen, mit Animation.
				menu.side.fadeOut(function(){
					menu.scroll.set(menu.scroll.States.STATIC);
				});
				prefs.set(menu.scroll.store_key, menu.scroll.States.STATIC);
				break;
			case menu.scroll.States.STICK_TOP:
			default:
				// diese Faelle sollten nicht vorkommen.
				console.log("Get-Menu Scroll-Button gedrückt obwohl unmöglich; state="+menu.scroll.state);
		}
	}); // end event menu.scroll.but.click.
	
	// nun ein paar Y-Koordinaten. berechnet mit dem Ausgangs-menu.side (STATIC).
	menu.scroll.origin_top = menu.side.offset().top;
	menu.scroll.max_bottom = $("footer").offset().top - menu.side.height();
	menu.scroll.stick_bottom = $("footer").offset().top - menu.side.height() - $("#background-color-container").offset().top;
	menu.scroll.button_max_bottom = $("footer").offset().top;
	//menu.scroll.max_bottom - $("#background-color-container").offset().top;

	$(window).scroll(function(){
		var y = $(this).scrollTop();

		switch(menu.scroll.state) {
			case menu.scroll.States.STATIC: break; // System inaktiv.
			case menu.scroll.States.FIX: 
				if(y < menu.scroll.origin_top)
					menu.scroll.set(menu.scroll.States.STICK_TOP);
				else if(y > menu.scroll.max_bottom)
					menu.scroll.set(menu.scroll.States.STICK_BOTTOM);
				break;
			case menu.scroll.States.STICK_TOP:
				if(y > menu.scroll.origin_top) {
					// wir sind wieder weiter runter gescrollt.
					if(menu.collapsed.u3.is_collapsed())
						// und der Benutzer hat zwischenzeitlich nicht das Menue ausgeklappt
						menu.scroll.set(menu.scroll.States.FIX);
					else
						// der Benutzer hat zwischenzeitlich ausgeklappt. Schalte fixing aus.
						menu.scroll.set(menu.scroll.States.STATIC);
				}
				break;
			case menu.scroll.States.STICK_BOTTOM:
				if(y < menu.scroll.max_bottom) {
					// wir sind wieder weiter hoch gescrollt. Entcollapsen bieten wir ganz
					// unten nicht an. Ergo: Fixing wieder einschalten.
					menu.scroll.set(menu.scroll.States.FIX);
				}
				break;
		}

		// Sichtbarkeit des Fixed-Buttons am unteren Seitenrand
		// festlegen:
		if(y + $(window).height() > menu.scroll.button_max_bottom) {
			$("html").addClass('button-stick-bottom');
		} else if($("html").hasClass('button-stick-bottom')) {
			$("html").removeClass('button-stick-bottom');
		}
	}); // end event window.scroll.
}; // end menu.scroll.setup.


/***************************************************************************************
  2. Footer Guided Tour System   menu.guide
  
     The "beam" is a fancy jquery application where the menu is cloned and displayed
     in the footer in a very other way. This is quite static compared to the
     applications above.

***************************************************************************************/
menu.guide.setup = function() {
	// Beam nur anzeigen wenn auf Seite, die auch in der Beamnavigation drin ist,
	// sprich Seitenleiste.
	if(!menu.side.hasClass( conf['seite_in_nav'] ))
		return false;

	// Zentraler Hauptschritt: Das Menue ab oberster Ebene klonen und im Footer dranhaengen,
	// ausserdem ein paar Ummodellierungen.
	g = menu.beam;
	menu.side.find(".u1").clone().appendTo(g);
	g.find("ul").show(); // durch menu.collapse.setup wurden die .u3er auf hide gesetzt. Revert!
	g.find(".geraete").remove(); // geraete-Links nicht anzeigen
	g.find("ul.u2 > li > a").remove(); // Ueberschriften entfernen
	

	// Texte ersetzen durch laengere verstaendlichere Beschreibungen im title
	g.find("a[title]").each(function(){
		$(this).text( $(this).attr('title') ).attr('title',''); // title attribut entfernen
	});

	// Abkuerzungen und Wrappings
	a = g.find("a"); li = g.find("li");
	a.wrapInner("<span class='text'/>").append("<span class='bullet'/>");

	// Punkte aequidistant verteilen
	count = a.length;
	bwidth = $(".bullet",g).outerWidth();
	each_width = (g.width() + bwidth*2) / count;
	each_width = g.width() / count;
	
	
	// problem: each_width = 16.384023... -> Math.floor liefert zu schmale Werte, direktes
	// a.width(each_width) hingegen kann mit Fliesskomma nicht umgehen. Daher jetzt ein Ansatz,
	// CSS3-Subpixelwerte mit ueberschaubar vielen Dezimalstellen anzuwenden.
	roundNumber = function(num,dec) { return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec); };
	subpixel_width = roundNumber(each_width, 2);
	a.css("width", subpixel_width+"px");
	//a.css("width", Math.floor(each_width)+"px");
	// text-Label zentriert darstellen um den Punkt
	$(".text", a).css("left", function(){return(bwidth - $(this).width())/2; });
	
	default_visibles = g.find(".start, .end, .current");
	default_visibles.addClass("visible"); //.find("a").css("z-index",0);
	default_visibles = default_visibles.find("a:first-child"); // von li auf a
	
	// Overlappings finden
	// left,right: Funktionen geben links/rechts-Offset des Objekts wieder
	left = function($o) { return $o.offset().left; }
	right = function($o) { return $o.offset().left + $o.width(); }
	edges = default_visibles.map(function(){
		t = $(".text", this);
		return {'left': left(t), 'right': right(t) };
	});
	min_left = Math.min.apply(null, edges.map(function(){ return this.left }));
	max_right = Math.max.apply(null, edges.map(function(){ return this.right; }));
	a.not(default_visibles).each(function(){
		t = $(".text", this); this_a = $(this);
		l = left(t); r = right(t);
		edges.each(function(i){
			if((l < this.right && l > this.left) || // rechte kante drin
			   (r > this.left && r < this.right) || // linke kante drin
			   (l < this.right && l < min_left)  ||
			   (r > this.left && r > max_right)) {
					this_a.addClass("higher-text");
			}
		});
	});
	
	// Split position for relative navigation
	// 20px von nav.side margin left; 40px = 4*10px padding left von nav.rel a
	///// 22.04.2012: Deaktiviert, weil anderes Design vor Augen.
	/*
	split = $(".current a",g).offset().left - g.offset().left + bwidth/2;
	rest = $("#content").outerWidth() - split - 40;
	menu.rel.find(".prev a").width(split);
	menu.rel.find(".next a").width(rest);
	*/
};


module.exports = menu; //{ menu: menu };
