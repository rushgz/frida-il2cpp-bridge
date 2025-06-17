namespace Il2Cpp {
    const console = (globalThis as any).console

    // 定义一个字典 key为类名，value为方法名
    export const classMethodMap: Map<string, Function> = new Map();

    export function toggleSimplify(isSimplify: boolean){
        (globalThis as any).SIMPLIFY = isSimplify;
    }

    function sliceStr(str: string|null): string{
        if(str === null){
            return "null"
        }
        if(str.startsWith('"{') && str.endsWith('}"')){
            return str.slice(1, -1)
        }else{
            return str
        }
    }

    function serializeObject(obj: any): string {
        try {
            const JsonConvert = Il2Cpp.domain.assembly("Newtonsoft.Json").image.class("Newtonsoft.JsonConvert");
            const result = JsonConvert.method("SerializeObject", 1).invoke(obj) as Il2Cpp.String;
            return sliceStr(result.toString());
        } catch (error) {
            const JsonUtility = Il2Cpp.domain.assembly("UnityEngine.JSONSerializeModule").image.class("UnityEngine.JsonUtility");
            const toJson = JsonUtility.method("ToJson", 2).invoke(obj, true) as Il2Cpp.String;
            return sliceStr(toJson.toString());
        }
    }
    
    export function toJson(obj: any): string {
        const isSimplify = (globalThis as any).SIMPLIFY;

        if (obj === null) {
            return "null";
        }else if (obj === undefined) {
            return "undefined";
        }
        if(obj instanceof Il2Cpp.Array){
            if(obj.isNull()){
                return "null";
            }
            try {
                if (isSimplify){
                    return serializeObject(obj);
                }
            } catch (error) {
                return "SIMPLIFY error"
            }
            try {
                if(obj.length === 0){
                    return "[]"
                }
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
            
            try {
                var type = obj.class.type.name;
            } catch (error) {
                var type = "unknown"
            }
            if (type.startsWith("System.Collections.Generic.List") || type.startsWith("System.Collections.Generic.ICollection")){
                try {
                    const size = obj.method("get_Count").invoke() as number
                    var result = '[\n'
                    for (let i = 0; i < size; i++) {
                        if(i>0){
                            result+=','
                        }
                        const dto = obj.method("System.Collections.IList.get_Item").invoke(i) as Il2Cpp.Object;
                        const dtoJson = toJson(dto)
                        result += dtoJson
                    }
                    result += '\n]'
                    return result;
                } catch (error) {
                    return "List error"
                }
            }else if(type.startsWith("System.Collections.Generic.Dictionary")){
                try {
                    const count = obj.method("get_Count").invoke() as number;
                    const entries = obj.method("System.Collections.Generic.IEnumerable<System.Collections.Generic.KeyValuePair<TKey,TValue>>.GetEnumerator").invoke() as Il2Cpp.Object;
                    const moveNext = entries.method("MoveNext");
                    const current = entries.method("System.Collections.IEnumerator.get_Current");
                    
                    let result = '{\n';
                    for (let i = 0; i < count; i++) {
                        if (i > 0) {
                            result += ',\n';
                        }
                        moveNext.invoke();
                        const entry = current.invoke() as Il2Cpp.Object;
                        const key = toJson(entry.field("key").value);
                        const value = toJson(entry.field("value").value);
                        result += `  "${key}": ${value}`;
                    }
                    result += '\n}';
                    return result;
                    
                } catch (error) {
                    return "Dictionary error"
                }
            }else if (type.includes("System.Collections.Generic.Stack")) {
                try {
                    const enumerator = obj.method("System.Collections.Generic.IEnumerable<System.Collections.Generic.KeyValuePair<TKey,TValue>>.GetEnumerator").invoke() as Il2Cpp.Object;
                    var result = '[\n';
                    var i = 0;
                    while (enumerator.method("MoveNext").invoke()) {
                        if (i > 0) {
                            result += ',\n';
                        }
                        const current = enumerator.field("System.Collections.IEnumerator.get_Current").value;
                        result += toJson(current)
                        i++;
                    }
                    result = result.slice(0, -2);
                    result += '\n]';
                    return result;
                } catch (error) {
                    return "Stack error"
                }
            }else{
                try {
                    const clazz = obj.class;
                    const func = classMethodMap.get(clazz.fullName);
                    if(func){
                        return func(obj) as string;
                    }
                    var json = serializeObject(obj)
                    //检查json是否与{}相等
                    if(!isSimplify && json.trim() === '"{}"'){
                        return printObject(obj);
                    }else{
                        return json;
                    }
                }catch(e){
                    try{
                        const method = obj.method<Il2Cpp.String>("ToString", 0)
                        if(method === null){
                            return sliceStr(obj.toString())
                        }else{  
                            return sliceStr(method.invoke().content)
                        }
                    }catch(e){
                        return "ToString error"
                    }
                }
            }
        }else{
            try{
                return sliceStr(obj.toString());
            }catch(e){
                return "error toString"
            }
        }
    }

    export function printObject(object: Il2Cpp.Object): string {
        let result = "{\n";
        let first = true;
        object.class.fields.forEach(field => {
            
            if (first) {
                first = false;
            }else{
                result += ",\n";
            }
            
            try {
                const value = object.field(field.name).value;
                result += `  "${field.name}": ${value}`
            } catch (error) {
                if(field.isStatic){
                    try {
                        result += `  "${field.name}": ${object.class.field(field.name).value}`
                    } catch (error) {
                        result += `  "${field.name}": static`
                    }
                }else{
                    result += `"  ${field.name}": error`
                }
            }
        });
        result += "}";
        return result;
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

    export function printCollection(obj: Il2Cpp.Array|Il2Cpp.Object, func: Function): string {
        if (obj instanceof Il2Cpp.Array) {
            return printArray(obj, func);
        } else if (obj instanceof Il2Cpp.Object) {
            return printList(obj, func);
        }else{
            return "collection error"
        }
    }

    function printArray(obj: Il2Cpp.Array, func: Function): string {
        try {
            if (obj.length === 0) {
                return "[]"
            }else if (obj.isNull()) {
                return "null"   
            }
            var result = '[\n'
            result += obj.elements.read(obj.length, 0).map(_ => func(_)).join(",\n")
            result += '\n]'
            return result;
        } catch (e) {
            return "error"
        }
    }

    function printList(obj: Il2Cpp.Object, func: Function): string {
        const size = obj.method("get_Count").invoke() as number
        var result = '[\n'
        for (let i = 0; i < size; i++) {
            if (i > 0) {
                result += ','
            }
            const dto = obj.method("System.Collections.IList.get_Item").invoke(i) as Il2Cpp.Object;
            const dtoJson = func(dto)
            result += dtoJson
        }
        result += '\n]'
        return result;
    }


}