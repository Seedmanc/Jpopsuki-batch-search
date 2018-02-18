let $ = s => document.querySelector(s);
let $$= s => document.querySelectorAll(s);
const mock = 0;

angular.module('myApp', [ 'ngSanitize' ])
    .controller('myCtrl', ['$scope', function ($scope) {
        $scope.query = '';
        $scope.found = {};
        $scope.missing = [];
        $scope.inProgress = false;
        $scope.list = [];
        $scope.counter = 0;
        $scope.keys = Object.keys;

        $scope.start = () => {
            $scope.inProgress = true;
            $scope.counter = 0;
            $scope.missing = [];
            $scope.found = {};

            $scope.list = parseQuery($scope.query);

            search($scope.list, $scope).then(found => {
                    console.log(found);
                    $scope.inProgress = false;
                    $scope.$apply();
                },
                error => {
                    $scope.inProgress = false;
                    $scope.$apply();
                    console.log(error)
                }
            );
        };


        $('textarea').onkeydown = function(e) {
            if(e.keyCode==9 || e.which==9){
                e.preventDefault();
                let s = this.selectionStart;
                this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s+1;
            }
        };
    }]);


function search(list, $scope) {
    let found = {};
    return new Promise((resolve, reject) => {
        (function recurse(index) {
            if (index > list.length-1) {
                return resolve(found)
            } else {
                let artist = list[index].artist;
                let title = list[index].title;

                setTimeout(()=>
                        getPage(
                            `https://jpopsuki.eu/ajax.php?section=torrents&type=&artistname=${artist}&action=advanced&torrentname=${title}&order_by=s3&order_way=desc`
                        )
                            .then(html => {
                                    if (html.content.querySelector('.torrent_table')) {
                                        found[artist+'\n—\n'+title] = html;
                                    } else {
                                        $scope.missing.push(`${title}\t${artist}`);
                                    }
                                    $scope.counter = index+1;
                                    $scope.found = found;
                                    $scope.$apply();
                                    recurse(index+1);
                                },
                                error => reject(error))
                    , mock ? 500 : 1000);
            }
        })(0);
    });
}

function getPage(url) {
    if (!url) {
        return Promise.reject('No url provided');
    }

    return (mock ? Promise.resolve(mockdata) : fetch(url, {credentials: 'same-origin'}).then(r => r.text()))
        .then(text => {
            let tmplt = document.createElement('template');

            tmplt.innerHTML = text;
            Array.from(tmplt.content.querySelectorAll('a')).forEach(a => {
                a.target = "_blank"
            });
            return tmplt;
        });
}

function parseQuery(query) {
    return query.split('\n')
        .map(line => {
            let split = line.split('\t');
            let artist = (split[1]||'').trim();
            let title = (split[0]||'').trim();

            if (!(artist && title))
                console.warn(!title && `No title found for ${line}, skipping`||'',
                    !artist && `No artist found for ${line}`||'');
            return {title, artist};
        })
        .filter(el => !!el.title);
}
