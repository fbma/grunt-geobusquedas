module.exports = function(grunt){
  grunt.config.init({
    checkAuto: {
      castillos: ['castillo del b'],
      sepim_sanlucarlamayor: ['horno'],
      sepim_montefrio: ['h'],
      sepim_alajar: ['h'],
      sepim_vegasdg: ['h'],
      sepim_almensilla: ['hacienda']
    },
    
     buildAuto: {
      castillos: ['masterHost','slaveHost'],
      sepim_sanlucarlamayor: ['masterHost','slaveHost'],
      sepim_montefrio: ['masterHost','slaveHost'],
      sepim_alajar: ['masterHost','slaveHost'],
      sepim_vegasdg: ['masterHost','slaveHost'],
      sepim_almensilla: ['masterHost','slaveHost']
    },

    endpoint: {
      host: 'http://geobusquedas-sigc.juntadeandalucia.es/geobusquedas/',
      masterHost: 'http://geobusquedas-sigc.maestro.juntadeandalucia.es/geobusquedas/',
      slaveHost: 'http://geobusquedas-sigc.esclavo.juntadeandalucia.es/geobusquedas/',
      suggest: '/suggest?wt=json&spellcheck.q=',
      build: '/suggest?spellcheck.build=true&wt=json'
    }
  });

  // Chequea el autocompletador de los cores
  grunt.registerMultiTask('checkAuto', 'Chequea autocompletado de cores', function() {
    var http = require('http'),
    done = this.async(),
    responses = 0;

    var core = this.target;
    var busquedas = this.data;

    grunt.config.requires('endpoint');

    busquedas.forEach(function(busqueda, i, arr){
      var body = [];
      url = grunt.config.get('endpoint.host');
      url += core + grunt.config.get('endpoint.suggest') + busqueda;

      http.get(url, function(res) {
        res.setEncoding('utf8');
        
        res.on('data', function(data){
          body.push(data);
        });

        res.on('end', function () {
         
          var cuerpo = JSON.parse(body.join());          
          if(cuerpo.spellcheck.suggestions.length>0){
                grunt.log.writeln( core ['yellow'] + ' - Autocompletado'['green'] + ' \'' + busqueda + '\' con: \n' + cuerpo.spellcheck.suggestions[1].suggestion);             
          }
          else{
                grunt.log.writeln( core ['yellow'] + ' - Ninguna propuesta encontrada para: '['red'] + busqueda);
          }
            
          // Si se han procesado todas los peticiones, hemos acabado
          if(responses++ == arr.length - 1)
            done();
        });
      }).on('error', function (err) {
        grunt.warn('Revisar la url del core: <'+ url +'>.');
        done(err);
      });
    });
  });
  
  // Construye el autocompletador para los cores
  grunt.registerMultiTask('buildAuto', 'Chequea autocompletado de cores', function() {
    var http = require('http'),
    done = this.async(),
    responses = 0;

    var core = this.target;
    var servidores = this.data;

    grunt.config.requires('endpoint');

    servidores.forEach(function(servidor, i, arr){
      var body = [];
      
      url =  grunt.config.get('endpoint.' + servidor);
      url += core + grunt.config.get('endpoint.build');
      
      http.get(url, function(res) {
        res.setEncoding('utf8');
        
        res.on('data', function(data){
          body.push(data);
        });

        res.on('end', function () {
          var cuerpo = JSON.parse(body);      
          if(cuerpo.responseHeader.status == 0){
                grunt.log.writeln( core ['yellow'] + '- ' + servidor + ' - Autocompletar creado'['green']);             
          }
          else{
                grunt.log.writeln( core ['yellow'] + '- Se ha producido un error'['red']);
          }
            
          // Si se han procesado todas las peticiones, hemos acabado
          if(responses++ == arr.length - 1)
            done();
        });
      }).on('error', function (err) {
        grunt.warn('Revisar la url de la llamada: <'+ url +'>.');
        done(err);
      });
    });
  });
  
  grunt.registerTask('default', ['checkAuto']);
}


