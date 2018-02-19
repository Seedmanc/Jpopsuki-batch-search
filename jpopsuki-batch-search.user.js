// ==UserScript==
// @name         Jpopsuki batch search
// @version      0.2
// @description  Search releases by a list of lookup queries at once
// @downloadURL  http://seedmanc.github.io/Jpopsuki-batch-search/jpopsuki-batch-search.user.js
// @author       Seedmanc
// @match        https://jpopsuki.eu/*
// @match        http://jpopsuki.eu/*
// @grant        none
// @noframes
// @run-at		 document-body
// ==/UserScript==

window.name = 'NG_DEFER_BOOTSTRAP!';

if (~document.location.href.indexOf('batch-search')) {
    fetch('https://seedmanc.github.io/Jpopsuki-batch-search/batch-search.html?v='+Math.random()).then(x=>x.text()).then(x=> {
        document.documentElement.innerHTML= x;
        let scripts = document.getElementsByTagName('script');
        activateScripts(scripts, 0);
    });
} else if($) {
    $('#searchbars ul').append($('<a href="https://jpopsuki.eu/batch-search.php">Batch search</a>'));
}

function activateScripts(scripts, i) {
    let node   = scripts[i],
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

function poll() {
    if ( angular && angular.resumeBootstrap) {
        angular.resumeBootstrap();
        document.querySelector('textarea').focus();
    } else {
        setTimeout(()=>poll(),500);
    }
}