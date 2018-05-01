var proxy = require('express-http-proxy');
var app = require('express')();
var port = process.env.PORT || '4000';


var HTMLParser = require('fast-html-parser');


app.use('/kolesarequests', proxy('https://kolesa.kz', {
proxyReqPathResolver: function(req) {
	console.log('i am done first ---- kolesa');
	return new Promise(function (resolve, reject) {
	  setTimeout(function () {   // simulate async
		// in this case I expect a request to /proxy => localhost:12345/a/different/path
		var resolvedPathValue = req.originalUrl.split('kolesarequests')[1];
		console.log(resolvedPathValue);
		resolve(resolvedPathValue);
	  }, 200);
	});
  },
  userResDecorator: function(proxyRes, proxyResData) {
    return new Promise(function(resolve) {	  
      setTimeout(function() {	
		var doc = HTMLParser.parse(proxyResData.toString('utf8'));
		var o = {};
		o.hrefs = [];
		o.imgs = [];
		o.descs = [];
		o.ishot = [];
		var ar = doc.querySelectorAll(".list-item.a-elem");  
		console.log(ar.length);
		if(ar.length !== 0){
			for(var i=0; i<ar.length; i++){
				var atag = ar[i].querySelector('a.list-link').rawAttrs.split(' ')[0];
				o.hrefs.push(atag);
				
				var imgtag = ar[i].querySelector('picture img').rawAttrs.split('\n')[0];
				o.imgs.push(imgtag);
				
				var titletag = ar[i].querySelector('.a-el-info-title a.list-link');
				if(titletag.childNodes.length !== 0){
					titletag = titletag.childNodes[0].rawText;
				}else{
					titletag = "";
				}
				
				var pricetag = ar[i].querySelector('.price'); 
				if(pricetag.childNodes.length !== 0){
					pricetag ="за " + pricetag.childNodes[0].rawText.replace(/\D+/g,"") + " тг";
				}else{
					pricetag = "";
				}
				
				
				var subtitletag = ar[i].querySelector('.desc');
				if(subtitletag.childNodes.length !== 0){
					var numchild = subtitletag.childNodes.length - 1;
					subtitletag = subtitletag.childNodes[numchild].rawText.replace(/\n|\s{2,}/g,"");
				}else{
					subtitletag = "";
				}
				
				var hottag = ar[i].querySelectorAll(".list-views-comments .tooltip-container");
				var hotmas = [];
				if(hottag.length !== 0){
					for(var j = 0; j < hottag.length; j++){
						var t = hottag[j].childNodes[0].rawAttrs.split(',')[0];
						if(t === "class=\"icon-hot\"" || t === "class=\"icon-up\""){
							hotmas.push(t);
						}	
					}
				}
				
				var mas = [];
				mas.push(titletag);
				mas.push(pricetag);
				mas.push(subtitletag);
				var strdesc = mas.join(" ");
				o.descs.push(strdesc);
				o.ishot.push(hotmas);	
			}
			console.log(o)
			console.log('**************************************');
			resolve(o);
		}else{
			console.log("Увы, нет таких объявлений");
			console.log('**************************************');
			resolve("Увы, нет таких объявлений");
		}
      }, 200);
    });
  }
}));