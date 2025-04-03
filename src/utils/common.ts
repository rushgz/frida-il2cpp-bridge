namespace Il2Cpp {
    const console = (globalThis as any).console

    function serializeObject(obj: any): string {
        try {
            const JsonConvert = Il2Cpp.domain.assembly("Newtonsoft.Json").image.class("Newtonsoft.JsonConvert");
            const result = JsonConvert.method("SerializeObject", 1).invoke(obj) as Il2Cpp.String;
            return result.toString();
        } catch (error) {
            const JsonUtility = Il2Cpp.domain.assembly("UnityEngine.JSONSerializeModule").image.class("UnityEngine.JsonUtility");
            const toJson = JsonUtility.method("ToJson", 2).invoke(obj, true) as Il2Cpp.String;
            return toJson.toString();
        }
    }
    
    export function toJson(obj: any): string {

        if (obj === null) {
            return "null";
        }else if (obj === undefined) {
            return "undefined";
        }
    
        if(obj instanceof Il2Cpp.Array){
            if(obj.isNull()){
                return "null";
            }
            console.log("to json",  obj.length)
            try {
                var result = '[\n'
                result += obj.elements.read(obj.length, 0).map(_=>toJson(_)).join(",\n")
                result += '\n]'
                return result;
            }catch(e){
                return obj.isNull()? "null" : `[${obj.elements.read(obj.length, 0)}]`;
            }
        }else if (obj instanceof Il2Cpp.Object)  {
            try {
                if(obj.isNull()){
                    return "null";
                }
            } catch (error) {
                return "null error"
            }
            
            var type = obj.class.type.name;
            if (type.startsWith("System.Collections.Generic.List")){
                const size = obj.method("get_Count").invoke() as number
                var result = '[\n'
                for (let i = 0; i < size; i++) {
                    if(i>0){
                        result+=','
                    }
                    const dto = obj.method("get_Item").invoke(i) as Il2Cpp.Object;
                    const dtoJson = toJson(dto)
                    result+=dtoJson.substring(1, dtoJson.length-1)
                }
                result += '\n]'
                return result;
            }else{
                try {
                    return serializeObject(obj)
                }catch(e){
                    return  obj.method<Il2Cpp.String>("ToString", 0).invoke().content ??"error to Json"
                }
            }
        }else{
            try{
                return obj.toString();
            }catch(e){
                return "error toString"
            }
        }
    }
    
    export function overloadToString(assemblyName: string, className: string){
        const Assembly = Il2Cpp.domain.assembly(assemblyName).image;
        
        // 获取WordData类
        const Class = Assembly.class(className);
        
        if (!Class) {
            console.log(`无法找到类: ${className}`);
            return;
        }
            
        // 检查是否存在toString方法
        if (Class.method("ToString")) {
            // 重写现有的ToString方法
            Class.method("ToString").implementation = function() {
                try {
                    const customString = toJson(this);
                    return Il2Cpp.string(customString);
                } catch (e) {
                    console.log("toJson", e);
                    // 调用原始的ToString方法
                    const originalToString = this.method("ToString").invoke();
                    return originalToString;
                }
            };
            console.log("已重写ToString方法");
        } else {
            // 如果没有现有的ToString方法，我们可以尝试添加一个或重写Object.ToString        
            
            // 重写Object.ToString方法
            Class.method("System.Object.ToString").implementation = function(): Il2Cpp.String {
                // 创建自定义字符串
                // 这里可以访问实例的各种属性构建更有意义的字符串
                const customString = "自定义WordData对象描述";
                
                return Il2Cpp.string(customString);
            };
            console.log("已重写Object.ToString方法");
        }
    }
}