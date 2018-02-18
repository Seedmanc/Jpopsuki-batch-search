let $ = s => document.querySelector(s);
let $$= s => document.querySelectorAll(s);

angular.module('myApp', [])
    .controller('myCtrl', ['$scope', function ($scope) {
        $scope.query = '';
        $scope.found = {};
        $scope.inProgress = false;
        let list = [];

        $scope.start = () => {
            $scope.inProgress = true;

            list = parseQuery($scope.query);
            recourse(0).then(data => console.log(data, $scope.found));
        };

        function recourse(index) {
            if (index > list.length-1) {
                return Promise.resolve('done')
            } else {
                let artist = list[index].artist;
                let title = list[index].title;

                return getPage(`https://jpopsuki.eu/ajax.php?section=torrents&type=&artistname=${artist}&action=advanced&torrentname=${title}&order_by=s3&order_way=desc`)
                    .then(html => {
                        $scope.found[artist+'\t'+title] = html;
                        recourse(index+1);
                    })
            }
        }


        $('textarea').onkeydown = function(e) {
            if(e.keyCode==9 || e.which==9){
                e.preventDefault();
                let s = this.selectionStart;
                this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s+1;
            }
        };
    }]);

function getPage(url) {
    if (!url) {
        return Promise.reject('No url provided');
    }

    return fetch(url, {credentials: 'same-origin'}).then(r => r.text())
        .then(text => {
            let tmplt = document.createElement('template'), html;

            tmplt.innerHTML = text;
            return (tmplt.content || tmplt);
        });
}

function parseQuery(query) {
    return query.split('\n')
        .map(line => {
            let split = line.split('\t');
            let artist = split[1].trim();
            let title = split[0].trim();

            if (!(artist && title))
                console.warn(!title && `No title found for ${line}, skipping`||'',
                    !artist && `No artist found for ${line}`||'');
            return {title, artist};
        })
        .filter(el => !!el.title);
}
