/* t29v7 little scripting
 *
 * In t29v6, we had our own javascript module system. In t29v7,
 * we let MediaWiki do the loading. Each script then calls $(t29.foo.setup);
 * for itself at the end.
 */

var menu = require("./menu.js"),
    auto_bildbreite = require("./auto_bildbreite.js"),
    img_license = require("./img_license.js");

$(function() {
    console.log("t29v7 ist geladen");
    
    menu.setup();
    auto_bildbreite.setup();
    img_license.setup();
});
