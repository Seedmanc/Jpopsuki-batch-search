let $ = s => document.querySelector(s);
let $$= s => document.querySelectorAll(s);

angular.module('myApp', [])
    .controller('myCtrl', ['$scope', function ($scope) {
        $scope.query = '';
        $scope.found = {};
        $scope.inProgress = false;
        $scope.list = [];
        $scope.counter = 0;

        $scope.start = () => {
            $scope.inProgress = true;
            $scope.counter = 0;

            $scope.list = parseQuery($scope.query);

            search($scope.list, $scope).then(found => {
                console.log(found);
                $scope.found = found;
                $scope.inProgress = false;
                $scope.$apply();
            }, () => $scope.inProgress = false);
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
                                    found[artist+'\t'+title] = html;
                                    $scope.$apply(()=>$scope.counter = index+1);
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
