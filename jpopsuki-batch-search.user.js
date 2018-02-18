// ==UserScript==
// @name         Jpopsuki batch search
// @version      0.1
// @description  Search releases by a list of lookup queries at once
// @author       seedmanc
// @match        http*://jpopsuki.eu/torrents.php*
// @match        http*://jpopsuki.eu/batch-search.php
// @grant        none
// @run-at		 document-body
// ==/UserScript==
window.name = 'NG_DEFER_BOOTSTRAP!';
function activateScripts(scripts, i) {
    var node   = scripts[i],
        parent = node.parentElement,
        d      = document.createElement('script');

    d.src = node.src;
    d.onload = function () {
        if (i < scripts.length - 1) {
            activateScripts(scripts, i + 1);
        }  else {poll();}
    };
    parent.insertBefore(d, node);
    parent.removeChild(node);
}

if (~document.location.href.indexOf('batch-search')) {
    fetch('http://localhost:4200/assets/batch-search.html').then(x=>x.text()).then(x=> {
        document.documentElement.innerHTML= x;
        var scripts = document.getElementsByTagName('script');
        console.log(scripts);

        activateScripts(scripts, 0)

        ;
        //document.write(x);
    });
} else {
    $('#searchbars ul').append($('<a href="http://jpopsuki.eu/batch-search.php">Batch search</a>'));
}

function poll() {
    if ( angular && angular.resumeBootstrap) {
        angular.resumeBootstrap();
    } else {
        setTimeout(()=>poll(),500);
    }
}