// ==UserScript==
// @name         Jpopsuki batch search
// @version      0.1
// @description  Search releases by a list of lookup queries at once
// @author       Seedmanc
// @match        https://jpopsuki.eu/*
// @match        http://jpopsuki.eu/*
// @grant        none
// @run-at		 document-body
// ==/UserScript==
window.name = 'NG_DEFER_BOOTSTRAP!';
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

if (~document.location.href.indexOf('batch-search')) {
    fetch('https://seedmanc.github.io/Jpopsuki-batch-search/batch-search.html').then(x=>x.text()).then(x=> {
        document.documentElement.innerHTML= x;
        let scripts = document.getElementsByTagName('script');
        activateScripts(scripts, 0);
    });
} else if($) {
    $('#searchbars ul').append($('<a href="https://jpopsuki.eu/batch-search.php">Batch search</a>'));
}

function poll() {
    if ( angular && angular.resumeBootstrap) {
        angular.resumeBootstrap();
    } else {
        setTimeout(()=>poll(),500);
    }
}