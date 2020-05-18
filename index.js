//Main
var http = require('http');
var fs = require('fs');
var url = require('url')
//query string
var qs = require('querystring');

//body 생성
function get_body(title, order, body){
    return `<!DOCTYPE html>
    <html lang="ko">
    <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    </head>
    <body>
    <h1><a href= "/">Blog by myoh.</a></h1>
    ${order}
    <p><a href="/create">CREATE</a></p>
    ${body}
    </body>
    </html>`;
}

//list 생성
function get_order(filelst){
    list = `<ul>`;
    for(var i=0; i < filelst.length; i++){
        list += `<li><a href = "/?id=${filelst[i]}"> Title : ${filelst[i]}</a></li>`
    list += `</ul>`
    return list
}
}

var app = http.createServer(function(request, response) {
    var url_ = request.url;
    var pathname = url.parse(url_, true).pathname;
    var query = url.parse(url_, true).query;
    
    if(pathname === '/'){
        if(query.id === undefined){
            fs.readdir('./data', function(err, filelist){
                var title = "Welcome Home!";
                var list = get_order(filelist)
                var body = `<h2>${title}</h2><p>This is main page.</p>`;
                response.writeHead(200);
                response.end(get_body(title, list, body));
            });  
        }
        //query.id가 존재하는 경우
        else{
            fs.readdir('./data', function(err, filelist){
                fs.readFile(`data/${query.id}`, 'utf8', function(err, data){
                    var title = query.id;
                    var list = get_order(filelist);
                    var body = `<h2>${title}</h2><p>${data}</p>`;
                    response.writeHead(200);
                    response.end(get_body(title, list, body));
                });   
            });
        }
    }
    else if(pathname === '/create'){
        fs.readdir('./data', function(err, filelist){
            var title = "Write new script!";
            var list = get_order(filelist);
            var body = `
            <h2>${title}</h2>
            <form action="/create_process" method = "post">
            <p><input type = "text" name = "title"></p>
            <p><textarea name = "body"></textarea></p>
            <input type ="submit" value="SUBMIT">
            </form>`
            response.writeHead(200)
            response.end(get_body(title, list, body));
        });
    }
    else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){
            body += data;
        });
        request.on('end', function(){
            //post가 의미하는 바는?
            var post = qs.parse(body);
            var title = post.title;
            var body_ = post.body;
        fs.writeFile(`data/${title}`, body_, 'utf8', function(err){
            response.writeHead(302, {Location : `/?id=${title}`});
            response.end();
        });
        });

    }
    //pathname이 '/'이 아닌 경우
    else{
        response.writeHead(404);
        response.end('Page is not found.');
}
});


app.listen(3000)