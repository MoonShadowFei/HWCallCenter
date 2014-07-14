
function HashMap()
 {
     /** Map 大小 **/
     var size = 0;
     /** Object **/
     var entry = new Object();
     
     /** Store **/
     this.put = function (key , value)
     {
         if(!this.containsKey(key))
         {
             size ++ ;
         }
         entry[key] = value;
     };
     
     /** Get**/
     this.get = function (key)
     {
         if( this.containsKey(key) )
         {
             return entry[key];
         }
         else
         {
             return null;
         }
     };
     
     /** Remove **/
     this.remove = function ( key )
     {
         if( delete entry[key] )
         {
             size --;
         }
     };
     
     /** Clear map **/ 
     this.clear = function() 
     {  
         try 
         {  
             delete entry;  
             entry = {};  
             size = 0;
         } 
         catch (e) 
         {  
             return e;  
         }  
     }; 
     
     /** Is Contain Key **/
     this.containsKey = function ( key )
     {
         return (key in entry);
     };
     
     /** Is Contain Value **/
     this.containsValue = function ( value )
     {
         for(var prop in entry)
         {
             if(entry[prop] == value)
             {
                 return true;
             }
         }
         return false;
     };
     
     /** All Value **/
     this.values = function ()
     {
//         var values = new Array(size);
    	 var values = new Array();
         for(var prop in entry)
         {
             values.push(entry[prop]);
         }
         return values;
     };
     
     /** All Key **/
     this.keys = function ()
     {
//         var keys = new Array(size);
    	 var keys = new Array();
         for(var prop in entry)
         {
             keys.push(prop);
         }
         return keys;
     };
     
     /** Map Size **/
     this.size = function ()
     {
         return size;
     };
 }