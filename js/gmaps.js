
        // make map available for easy debugging
   var gmap;

        // avoid pink tiles
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
        OpenLayers.Util.onImageLoadErrorColor = "transparent";


   GEOSERVER.view=function (id){
            
		    /**
		     * The commercial layers (Google, Virtual Earth, and Yahoo) are
		     * in a custom projection - we're calling this Spherical Mercator.
		     * GeoServer understands that requests for EPSG:900913 should
		     * match the projection for these commercial layers.  Note that
		     * this is not a standard EPSG code - so, if you want to load
		     * layers from another WMS, it will have to be configured to work
		     * with this projection.
		     */
		
		OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
		OpenLayers.Util.onImageLoadError = function() {};
	    
		// http://trac.osgeo.org/openlayers/wiki/SphericalMercator
		//OpenLayers.Projection.addTransform("EPSG:4326", "EPSG:3857", OpenLayers.Layer.SphericalMercator.projectForward);
		//OpenLayers.Projection.addTransform("EPSG:3857", "EPSG:4326", OpenLayers.Layer.SphericalMercator.projectInverse);
	
	    var maxBBox = [-3789294.8875171,2523306.0998924,2472426.4684829,6324366.6417768];
	    gmap = new OpenLayers.Map('map', {
         theme: "openlayers/theme/default/style.css",
         controls: [
              new OpenLayers.Control.Navigation(),
              new OpenLayers.Control.ScaleLine({bottomInUnits: "", bottomOutUnits: ""}),
              new OpenLayers.Control.PanZoomBar({position: new OpenLayers.Pixel(5,5)}),
              new OpenLayers.Control.TouchNavigation({
                 dragPanOptions: {
                     enableKinetic: true
                 }
                 }),
              new OpenLayers.Control.LayerSwitcher({ roundedCornerColor : '#0a8161' })
         ],
         projection: 'EPSG:3857',
         units: 'm',
            maxExtent: GEOSERVER.buildBounds(maxBBox),
         	restrictedExtent: GEOSERVER.buildBounds(maxBBox),
            resolutions: [4891.96980957, 2445.984904785, 1222.992452393, 611.4962261963, 305.7481130981, 152.8740565491, 76.43702827454, 38.21851413727, 19.10925706863, 9.554628534317, 4.777314267159, 2.388657133579]
	    });

			
        
      var mapa=GEOSERVER.getById(id);
		gmap.addLayers(GEOSERVER.buildLayers(mapa))
	  // gmap.zoomToExtent(GEOSERVER.buildBounds([-2410982.391673,3132111.7637233,1106343.9014078,5504717.1213647]));
		//gmap.zoomTo(0);

		try{
			//$x('//*[@class="gm-style"]/div[2]')[0].style.display="none";
			$('.gm-style').children()[1].style.display="none";
		}catch(ex){}


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
                        return new OpenLayers.Layer.Google(name, {
                           sphericalMercator: true,
                           minZoomLevel: zoomLevels[0],
                           maxZoomLevel: zoomLevels[1],
                           type: type
                        });

              			})(layer.name,layer.view?google.maps.MapTypeId[layer.view]:google.maps.MapTypeId.SATELLITE));
                 }else if (type=="WMS"){
                    list.push(new OpenLayers.Layer[type](
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

		
		function addClickControl(map) {
			map.events.register("click", map , showFicha);
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
			defaultHandlerOptions: {
				'single': true,
				'double': false,
				'pixelTolerance': 0,
				'stopSingle': false,
				'stopDouble': false
			},

			initialize: function(options) {
				this.handlerOptions = OpenLayers.Util.extend(
					{}, this.defaultHandlerOptions
				);
				OpenLayers.Control.prototype.initialize.apply(
					this, arguments
				); 
				this.handler = new OpenLayers.Handler.Click(
					this, {
						'click': this.trigger
					}, this.handlerOptions
				);
			}, 

			trigger: function(e) {
				var lonlat = map.getLonLatFromViewPortPx(e.xy);
				console.log(lonlat.lat + " N, " + lonlat.lon + " E");
			}

		});

			var click = new OpenLayers.Control.Click();
		    	map.addControl(click);
		    	click.activate();
		}

	}

	function showBounds(map){

            // the part below is just to make the bounds show up on the page
            var boundsOutput = document.getElementById('bounds');
            function updateBounds() {
                var code =
                    "    var bounds = new OpenLayers.Bounds(\n" +
                    "        " + map.getExtent().toBBOX().replace(/,/g, ', ') + "\n" +
                    "    );\n" +
                    "    map.zoomToExtent(bounds);"
                boundsOutput.innerHTML = code;
            }
            // update the bounds with each map move
            map.events.register('moveend', map, updateBounds);
            // and update the bounds on first load
            updateBounds();
        }
     function Controles(){
                       try{
                // wire up the option button
                $("#options").on("click", function (event){
                    var toolbar = document.getElementById("toolbar");
                    if (toolbar.style.display == "none") {
                        toolbar.style.display = "block";
                    }
                    else {
                        toolbar.style.display = "none";
                    }
                    event.stopPropagation();
                    map.updateSize()
		            });
                
                // support GetFeatureInfo
                map.events.register('click', map, function (e) {
                    $('#nodelist').innerHTML = "Cargando...";

                    var params = {
                        REQUEST: "GetFeatureInfo",
                        EXCEPTIONS: "application/vnd.ogc.se_xml",
                        BBOX: map.getExtent().toBBOX(),
                        SERVICE: "WMS",
                        INFO_FORMAT: 'text/html',
                        QUERY_LAYERS: map.layers[CURRENT].params.LAYERS,
                        FEATURE_COUNT: 50,
                        "Layers": LAYER,
                        WIDTH: map.size.w,
                        HEIGHT: map.size.h,
                        format: format,
                        styles: map.layers[CURRENT].params.STYLES,
                        srs: map.layers[CURRENT].params.SRS};
                    
                    // handle the wms 1.3 vs wms 1.1 madness
                    if(map.layers[CURRENT].params.VERSION == "1.3.0") {
                        params.version = "1.3.0";
                        params.j = parseInt(e.xy.x);
                        params.i = parseInt(e.xy.y);
                    } else {
                        params.version = "1.1.1";
                        params.x = parseInt(e.xy.x);
                        params.y = parseInt(e.xy.y);
                    }
                        
                    // merge filters
                    if(map.layers[CURRENT].params.CQL_FILTER != null) {
                        params.cql_filter = map.layers[CURRENT].params.CQL_FILTER;
                    } 
                    if(map.layers[CURRENT].params.FILTER != null) {
                        params.filter = map.layers[CURRENT].params.FILTER;
                    }
                    if(map.layers[CURRENT].params.FEATUREID) {
                        params.featureid = map.layers[CURRENT].params.FEATUREID;
                    }
                    OpenLayers.loadURL( GEOSERVER_URL(WS), params, this, setHTML, setHTML);
                    OpenLayers.Event.stop(e);
                });
                }catch(ex){console.log(ex);} 

     }  
