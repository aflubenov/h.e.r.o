var vectorLib = {
    tolerance: 0.0,
    module: function (pVector) {
        var i = 0,
            l = pVector.length,
            iSum = 0;
            
            for (i = 0; i < l; i += 1) {
                iSum = iSum + (pVector[i]*pVector[i]);
            }
            
            return Math.sqrt(iSum);
    },
    isCeroTolerated: function (pVector) {
        //console.log ('cerotolerated: ', vectorLib.module(pVector));
        return vectorLib.module(pVector) <= vectorLib.tolerance;   
    },
    isCero: function (pVector) {
        var i = 0,
            l = pVector.length;
            
        for( i = 0; i < l; i += 1) {
            if(pVector[i] !== 0) {
                return false;
            }
        }
        
        return true;
    },
    scale: function (pVector, pScalar) {
        var i = 0,
            l = pVector.length,
            aRet = pVector.slice();
            
        for (i = 0; i < l; i += 1) {
            aRet[i] = pVector[i]*pScalar;
        }
        
        return aRet;
    },
    
    sum: function (pVector1, pVector2) {
        var i = 0,
            l = pVector1.length,
            aRet = pVector1.slice();
            
            
        for (i = 0; i < l; i += 1) {
            aRet[i] = pVector1[i] + pVector2[i];
        }
        
        return aRet;
    }
};