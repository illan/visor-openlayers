
try{
  				OpenLayers= (OpenLayers)||ol;
}catch(e){
  				
  				OpenLayers=ol;
}  
            // pink tile avoidance
            OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
            // make OL compute scale according to WMS spec
            OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
				var map;

	    		var GEOSERVER={
              current:-1,
              bounds:[],
              mapas:[],
              servicios:[],
              projection:"EPSG:25830",
              maxBBox :[-3789294.8875171,2523306.0998924,2472426.4684829,6324366.6417768]
            }
          
				GEOSERVER.configure=function (data,id){
              if (id){

                  $.extend(GEOSERVER.mapas[id],data,{type:"WMS"})
               
              } else {
              		$.extend(this,data);
              }  
            }
            GEOSERVER.getById=function getById(id){
              for (var indx in this.mapas){
                var mapa=this.mapas[indx];
                	if (mapa.id==id) return mapa;
              }
              return null;
            }
        	  GEOSERVER.loader=function (id){
              	var mapa=this.getById(id);
        				 if (mapa.type=="JSON"){

        				             $.getJSON(mapa.path)
                                 .success(function(data){
                                            GEOSERVER.configure(data,id);
                                		        GEOSERVER.show(id);
        				               })
                                 .error(function(e){
                                                 console.log(e);              			
                                 });
                   }else
			        		GEOSERVER.show(id);	
            }  
            	
				GEOSERVER.buildBounds=function buildBounds(arr){
              	var bounds=arr||GEOSERVER.bounds
        			return new OpenLayers.Bounds(arr[0],arr[1],arr[2],arr[3]);
      		}
            
            
            	GEOSERVER.buildLayers=function buildLayers(mapa){
            	var tileSize = [256, 256];
        			var gutter=0;
                // setup tiled layer
                // 
              

               var list=[]; 
        			
					for (var layer in mapa[mapa.type]){
                 var type=layer.type||mapa.type;
                 if (type=="GMAPS"){
                 		 list.push((function buildGoogleLayer(name,type) {
                        var zoomLevels = [5, 16];
                        return new ol.Layer.Google(name, {
                           sphericalMercator: true,
                           minZoomLevel: zoomLevels[0],
                           maxZoomLevel: zoomLevels[1],
                           type: type
                        });

              			})(layer.name,layer.view?google.maps.MapTypeId[layer.view]:google.maps.MapTypeId.SATELLITE));
                 }else if (type=="WMS"){
                    list.push(new ol.Layer[type](
                          layer.name,
                          layer.url,
                          {
                              "LAYERS": layer.layers,
                              "STYLES": layer.styles||"",
                              transparent: layer.transparent?"TRUE":"FALSE",
                              format:  'image/png'
                          },
                          {
                             singleTile: true, 
                             ratio: 1, 
                             isBaseLayer:layer.isBaseLayer,
                             yx : layer.xy
                          } 
                  ));
              	 } 
               }
     		return list;
    }         

            GEOSERVER.show=function (id){
              
              /***
              var mapa=this.getById(id);
                // if this is just a coverage or a group of them, disable a few items,
                // and default to jpeg format
                format = 'image/png';
                if(GEOSERVER.pureCoverage) {
                    document.getElementById('filterType').disabled = true;
                    document.getElementById('filter').disabled = true;
                    document.getElementById('antialiasSelector').disabled = true;
                    document.getElementById('updateFilterButton').disabled = true;
                    document.getElementById('resetFilterButton').disabled = true;
                    document.getElementById('jpeg').selected = true;
                    format = "image/jpeg";
                }
					 var bounds= this.buildBounds(mapa.bounds||GEOSERVER.bounds);
                map = GEOSERVER.map = new OpenLayers.Map('map', {
                    controls: [],
                    maxExtent:bounds ,
                    maxResolution: 1451.9378194747733,
                    projection:mapa.projection||GEOSERVER.projection ,
                    units: 'm'
                });
            
		
                // build up all controls
                map.addControl(new OpenLayers.Control.PanZoomBar({
                    position: new OpenLayers.Pixel(2, 15)
                }));
                map.addControl(new OpenLayers.Control.Navigation());
                map.addControl(new OpenLayers.Control.Scale($('scale')));
                map.addControl(new OpenLayers.Control.MousePosition({element: $('location')}));
					 map.addControl(new OpenLayers.Control.LayerSwitcher({ roundedCornerColor : '#0a8161' }));
                map.zoomToExtent(bounds);
                **/
              GEOSERVER.initOpenLayers(id);
            }



 var map;

GEOSERVER.initOpenLayers=function(id){
  
      var mapa=this.current=this.getById(id);
      var pureCoverage = false;
      // if this is just a coverage or a group of them, disable a few items,
      // and default to jpeg format
      var format = 'image/png';
      var bounds = mapa.bounds||this.bounds;
      if (pureCoverage) {
        document.getElementById('filterType').disabled = true;
        document.getElementById('filter').disabled = true;
        document.getElementById('antialiasSelector').disabled = true;
        document.getElementById('updateFilterButton').disabled = true;
        document.getElementById('resetFilterButton').disabled = true;
        document.getElementById('jpeg').selected = true;
        format = "image/jpeg";
      }

      var mousePositionControl = new ol.control.MousePosition({
        className: 'custom-mouse-position',
        target: document.getElementById('location'),
        coordinateFormat: ol.coordinate.createStringXY(5),
        undefinedHTML: '&nbsp;'
      });
      var untiled = new ol.layer.Image({
        source: new ol.source.ImageWMS({
          ratio: 1,
          url: mapa.url ,
          params: {'FORMAT': format,
                   'VERSION': '1.1.1',  
                LAYERS: mapa.layers,
                STYLES: '',
          }
        })
      });

      var projection = new ol.proj.Projection({
          code: mapa.projection,
          units: 'm',
          axisOrientation: 'neu'
      });
  
      var capas= [] ;
  		//mapa.layers.forEach(function(layerId){
  		for (var indx in mapa[mapa.type]){
        var layer=mapa[mapa.type][indx];
        /**
                        capas.push(new ol.layer.Tile({
                        visible: false,
                        source: new ol.source.TileWMS({
                          url: mapa.url ,
                          params: {'FORMAT': format, 
                                   'VERSION': '1.1.1',
                                   tiled: true,
                                LAYERS: layerId,
                                STYLES: '',
                          }
                        })
                      }));
          **/
                var type=layer.type||mapa.type;
                 if (type=="GMAPS"){
                 		 capas.push((function buildGoogleLayer(name,type) {
                        var zoomLevels = [5, 16];
                        return new ol.Layer.Google(name, {
                           sphericalMercator: true,
                           minZoomLevel: zoomLevels[0],
                           maxZoomLevel: zoomLevels[1],
                           type: type
                        });

              			})(layer.name,layer.view?google.maps.MapTypeId[layer.view]:google.maps.MapTypeId.SATELLITE));
                 }else if (type=="WMS"){
                    capas.push(new ol.layer.Tile({
                        visible: false,
                        source: new ol.source.TileWMS({
                          url: layer.url ,
                          params: {'FORMAT': format, 
                                   'VERSION': '1.1.1',
                                   tiled: true,
                                LAYERS: layer.layers,
                                STYLES: '',
                                transparent: layer.transparent?"TRUE":"FALSE",
                          }
                        })
                      })
                      /**new ol.Layer[type](
                          layer.name,
                          layer.url,
                          {
                              "LAYERS": layer.layers,
                              "STYLES": layer.styles||"",
                              transparent: layer.transparent?"TRUE":"FALSE",
                              format:  'image/png'
                          },
                          {
                             singleTile: true, 
                             ratio: 1, 
                             isBaseLayer:layer.isBaseLayer,
                             yx : layer.xy
                          } 
                  )**/
                    );
                 }
      };  
          map = this.map = new ol.Map({
            controls: ol.control.defaults({
              attribution: false
            }).extend([mousePositionControl]),
            target: 'map',
            layers: capas,
            view: new ol.View({
               projection: projection
            })
          });
      map.getView().on('change:resolution', function(evt) {
        var resolution = evt.target.get('resolution');
        var units = map.getView().getProjection().getUnits();
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var scale = resolution * mpu * 39.37 * dpi;
        if (scale >= 9500 && scale <= 950000) {
          scale = Math.round(scale / 1000) + "K";
        } else if (scale >= 950000) {
          scale = Math.round(scale / 1000000) + "M";
        } else {
          scale = Math.round(scale);
        }
        document.getElementById('scale').innerHTML = "Scale = 1 : " + scale;
      });
      map.getView().fitExtent(bounds, map.getSize());
      map.on('singleclick', function(evt) {
        document.getElementById('nodelist').innerHTML = "Loading... please wait...";
        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = untiled.get('visible') ? untiled.getSource() : tiled.getSource();
        var url = source.getGetFeatureInfoUrl(
          evt.coordinate, viewResolution, view.getProjection(),
          {'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': 50});
        if (url) {
          document.getElementById('nodelist').innerHTML = '<iframe seamless src="' + url + '"></iframe>';
        }
      });

      // sets the chosen WMS version
      function setWMSVersion(wmsVersion) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'VERSION': wmsVersion});
        });
      }

      // Tiling mode, can be 'tiled' or 'untiled'
      function setTileMode(tilingMode) {
        if (tilingMode == 'tiled') {
          untiled.set('visible', false);
          tiled.set('visible', true);
        } else {
          tiled.set('visible', false);
          untiled.set('visible', true);
        }
      }

      function setAntialiasMode(mode) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'FORMAT_OPTIONS': 'antialias:' + mode});
        });
      }

      // changes the current tile format
      function setImageFormat(mime) {
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'FORMAT': mime});
        });
      }

      function setStyle(style){
        map.getLayers().forEach(function(lyr) {
          lyr.getSource().updateParams({'STYLES': style});
        });
      }

      function setWidth(size){
        var mapDiv = document.getElementById('map');
        var wrapper = document.getElementById('wrapper');

        if (size == "auto") {
          // reset back to the default value
          mapDiv.style.width = null;
          wrapper.style.width = null;
        }
        else {
          mapDiv.style.width = size + "px";
          wrapper.style.width = size + "px";
        }
        // notify OL that we changed the size of the map div
        map.updateSize();
      }

      function setHeight(size){
        var mapDiv = document.getElementById('map');
        if (size == "auto") {
          // reset back to the default value
          mapDiv.style.height = null;
        }
        else {
          mapDiv.style.height = size + "px";
        }
        // notify OL that we changed the size of the map div
        map.updateSize();
      }

      function updateFilter(){
        if (pureCoverage) {
          return;
        }
        var filterType = document.getElementById('filterType').value;
        var filter = document.getElementById('filter').value;
        // by default, reset all filters
        var filterParams = {
          'FILTER': null,
          'CQL_FILTER': null,
          'FEATUREID': null
        };
        if (filter.replace(/^\s\s*/, '').replace(/\s\s*$/, '') != "") {
          if (filterType == "cql") {
            filterParams["CQL_FILTER"] = filter;
          }
          if (filterType == "ogc") {
            filterParams["FILTER"] = filter;
          }
          if (filterType == "fid")
            filterParams["FEATUREID"] = filter;
          }
          // merge the new filter definitions
          map.getLayers().forEach(function(lyr) {
            lyr.getSource().updateParams(filterParams);
          });
        }

        function resetFilter() {
          if (pureCoverage) {
            return;
          }
          document.getElementById('filter').value = "";
          updateFilter();
        }

        // shows/hide the control panel
        function toggleControlPanel(){
          var toolbar = document.getElementById("toolbar");
          if (toolbar.style.display == "none") {
            toolbar.style.display = "block";
          }
          else {
            toolbar.style.display = "none";
          }
          map.updateSize()
        }
}


