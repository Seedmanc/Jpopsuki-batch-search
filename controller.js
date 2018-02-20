angular.module('myApp', [ 'ngSanitize' ])
    .controller('myCtrl', ['$scope', function ($scope) {
        $scope.query = '';
        $scope.found = {};
        $scope.missing = [];
        $scope.inProgress = false;
        $scope.list = [];
        $scope.counter = 0;
        $scope.keys = Object.keys;
        $scope.pvonly = true;

        $scope.start = () => {
            $scope.inProgress = true;
            $scope.counter = 0;
            $scope.missing = [];
            $scope.found = {};

            $scope.list = parseQuery($scope.query);

            search($scope.list, $scope).then(() => {
                    $scope.inProgress = false;
                    $scope.$apply();
                },
                error => {
                    $scope.inProgress = false;
                    $scope.$apply();
                    console.error(error)
                }
            );
        };


        document.querySelector('textarea').onkeydown = function(e) {
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
                let artistPlus = artist.replace(/\+/g,'%2B');
                let titlePlus = title.replace(/\+/g,'%2B');

                setTimeout(()=>
                        getPage(
                            `https://jpopsuki.eu/ajax.php?section=torrents&searchstr=${titlePlus}+${artistPlus}&order_by=s3&order_way=desc` +
                            ($scope.pvonly ? '&filter_cat[3]=1' : '')
                        )
                            .then(html => {
                                    if (html.content.querySelector('.torrent_table')) {
                                        found[artist+' - '+title] = html;
                                    } else {
                                        $scope.missing.push(`${title}\t${artist}`);
                                    }
                                    $scope.counter = index+1;
                                    $scope.found = found;
                                    $scope.$apply();
                                    recurse(index+1);
                                },
                                error => reject(error))
                    , 1000);
            }
        })(0);
    });
}

function getPage(url) {
    if (!url) {
        return Promise.reject('No url provided');
    }

    return fetch(url, {credentials: 'same-origin'}).then(r => r.text())
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
            let split = line.split(/\t+/);
            let artist = (split[1]||'').trim();
            let title = (split[0]||'').trim();

            if (!(artist && title))
                console.warn(!title && `No title found for ${line}, skipping`||'',
                    !artist && `No artist found for ${line}`||'');
            return {title, artist};
        })
        .filter(el => !!el.title);
}
