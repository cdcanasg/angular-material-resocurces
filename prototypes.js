Object.defineProperty(Array.prototype, 'unique', {
    enumerable:false,
    writable:true,
    value:function (){
        return this.filter(function (value, index, self) { 
            var searchKey = 0;
            if(typeof value == 'object'){
                var stringValue = JSON.stringify(value);
                var coincidence = false;
                for(var key=0;key<self.length;key++){
                    if(!coincidence){
                        var stringIndexValue = JSON.stringify(self[key]);
                        coincidence = stringIndexValue === stringValue;
                        searchKey = coincidence ? key : 0;
                    }
                }
            }else{
                var searchKey = self.indexOf(value);
            }
            return searchKey === index;
        });
    }
});


Object.defineProperty(moment.prototype,'arrayOfMonths',{
    enumerable:false,
    writable:true,
    value:function(){
        thisMoment = this;
    	return Array.apply(0, Array(12)).map(function(_,i){
            var objectItem = {};
            objectItem.id = thisMoment.month(i).format('MMMM');
            objectItem.nombre = thisMoment.month(i).format('MMMM');
            return objectItem;
        });
    }
});

Object.defineProperty(Array.prototype,'getRate',{
	enumerable:false,
	writable:true,
	value:function (div,keysObj,keyCompare){
        var num = this;
        var arrayr = [];
        if (num.length==div.length) {
            angular.forEach(num,function(val,key){
            	var obj = {};
            	angular.forEach(val,function(v1, k1){
                    if(k1!=keysObj[0]){
                        obj[k1] = v1;
                    }
            	});

            	//
            	var keyDiv = 0;
            	angular.forEach(div, function(val2,key2){
                    var isSame = true;
                    angular.forEach(obj,function(v2,k2){
                        if (val2[k2]!=v2) {
                            isSame = false;
                        }
                    });
                    if(isSame){
                        keyDiv = key2;
                    }
            	});

            	obj.total = Number.parseFloat(val[keysObj[0]]/div[keyDiv][keysObj[1]],2).toFixed(3);
                arrayr.push(obj);
            });
        }else{
            return arrayr;
        }

        return arrayr;
    }
});

Object.defineProperty(Array.prototype, 'setMonthAsString', {
    enumerable:false,
    writable:true,
    value:function setMonth(key){
        var data =this;
        var returnArray = [];
        angular.forEach(data, function(val){
            if (val[key]) {
                val[key] = getMonthString(val[key]);
            }
            returnArray.push(val);
        });
        return returnArray;

        function getMonthString(month){
            var year = moment().format('YYYY');
            var month = moment(year + '/' + month + '/15').format('MMMM');
            return month;
        }
    }
});


Object.defineProperty(Array.prototype, 'groupingData', {
    enumerable:false,
    writable:true,
    value:function (groupArray,totalKey){
        var data = this;
        var groupObject={};
        var combinatorio = [];
        angular.forEach(groupArray,function(gp){
            groupObject[gp]=[];
            angular.forEach(data,function(val){
                groupObject[gp].push(val[gp]);
            });
        });

        angular.forEach(groupObject,function(arr,key){
            groupObject[key] = arr.unique();
        });

        var returnArray2 = [];
        var arrayLength = 1;
        angular.forEach(groupObject, function(gp){
            arrayLength=arrayLength * gp.length;
        });

        for(var i=0;i<arrayLength;i++){
            var objectItem = {};
            objectItem[totalKey]=0;
            combinatorio.push(objectItem);
        }

        var copiaIntraGrupo = combinatorio.length;
        angular.forEach(groupObject,function(gp,gpk){
            var contador = 0;
            var elementos = gp.length;
            copiaIntraGrupo = copiaIntraGrupo/elementos;
            var numeroGrupos = arrayLength / (elementos * copiaIntraGrupo);
            //arrayLength = arrayLength/gp.length;

            for(var i=0; i<numeroGrupos;i++){
                for(var j=0; j<elementos; j++){
                    for(var k=0; k<copiaIntraGrupo; k++){
                        combinatorio[contador][gpk]=gp[j];
                        contador = contador + 1;
                    }
                }     
            };
        });

        var datosMensualesObject = {};
        var returnArray = [];
        angular.forEach(data,function(val){
            var arreglo2 = {};
            angular.forEach(groupArray,function(group){
                var objectItem = {};
                arreglo2[group] = val[group];
            });

            var indice = 0;
            angular.forEach(combinatorio,function(item,posicion){
                var coincidencia = true;
                angular.forEach(arreglo2,function(group,key){
                    if(group!=item[key] && coincidencia){
                        coincidencia = false;
                    }
                });

                if(coincidencia){
                    indice = posicion;
                }
            });
            combinatorio[indice][totalKey] = combinatorio[indice][totalKey] + val[totalKey];
        });

        return combinatorio;
    }
});
