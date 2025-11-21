namespace Il2Cpp {
    /**
     * 类型属性的标志位掩码。
     */
    const ATTRIBUTES = {
        // 类型修饰符
        ABSTRACT: 0x00000080,              // TYPE_ATTRIBUTE_ABSTRACT
        SEALED: 0x00000100,                // TYPE_ATTRIBUTE_SEALED
        SPECIAL_NAME: 0x00000400,          // TYPE_ATTRIBUTE_SPECIAL_NAME

        // 类语义掩码
        CLASS_SEMANTIC_MASK: 0x00000020,   // TYPE_ATTRIBUTE_CLASS_SEMANTIC_MASK
        CLASS: 0x00000000,                 // TYPE_ATTRIBUTE_CLASS
        INTERFACE: 0x00000020,             // TYPE_ATTRIBUTE_INTERFACE
    };

    /**
     * 根据标志位获取类型的修饰符(如 abstract、sealed、static)。
     * @param flags 标志位
     * @param is_valuetype 是否是值类型
     * @param is_enum 是否是枚举
     * @returns 类型的修饰符字符串
     */
    export function getTypeModifiers(flags: number, is_valuetype: boolean, is_enum: boolean): string {
        let modifiers = "";

        // 判断是否是 static
        if ((flags & ATTRIBUTES.ABSTRACT) && (flags & ATTRIBUTES.SEALED)) {
            modifiers += "static ";
        }
        // 判断是否是 abstract
        else if (!(flags & ATTRIBUTES.INTERFACE) && (flags & ATTRIBUTES.ABSTRACT)) {
            modifiers += "abstract ";
        }
        // 判断是否是 sealed(非值类型且非枚举)
        else if (!is_valuetype && !is_enum && (flags & ATTRIBUTES.SEALED)) {
            modifiers += "sealed ";
        }

        return modifiers;
    }

    /**
     * 获取方法的修饰符(类似 Zygisk-Il2CppDumper 的格式)
     * @param flags 方法标志位
     * @param implementationFlags 方法实现标志位
     * @returns 方法修饰符字符串
     */
    export function getMethodModifiers(flags: number, implementationFlags: number): string {
        const METHOD_ATTRIBUTE_MEMBER_ACCESS_MASK = 0x0007;
        const METHOD_ATTRIBUTE_PRIVATE = 0x0001;
        const METHOD_ATTRIBUTE_PUBLIC = 0x0006;
        const METHOD_ATTRIBUTE_FAMILY = 0x0004;
        const METHOD_ATTRIBUTE_ASSEM = 0x0003;
        const METHOD_ATTRIBUTE_FAM_AND_ASSEM = 0x0002;
        const METHOD_ATTRIBUTE_FAM_OR_ASSEM = 0x0005;
        const METHOD_ATTRIBUTE_STATIC = 0x0010;
        const METHOD_ATTRIBUTE_ABSTRACT = 0x0400;
        const METHOD_ATTRIBUTE_FINAL = 0x0020;
        const METHOD_ATTRIBUTE_VIRTUAL = 0x0040;
        const METHOD_ATTRIBUTE_VTABLE_LAYOUT_MASK = 0x0100;
        const METHOD_ATTRIBUTE_NEW_SLOT = 0x0100;
        const METHOD_ATTRIBUTE_REUSE_SLOT = 0x0000;
        const METHOD_ATTRIBUTE_PINVOKE_IMPL = 0x2000;

        let output = "";

        // 访问修饰符
        const access = flags & METHOD_ATTRIBUTE_MEMBER_ACCESS_MASK;
        switch (access) {
            case METHOD_ATTRIBUTE_PRIVATE:
                output += "private ";
                break;
            case METHOD_ATTRIBUTE_PUBLIC:
                output += "public ";
                break;
            case METHOD_ATTRIBUTE_FAMILY:
                output += "protected ";
                break;
            case METHOD_ATTRIBUTE_ASSEM:
            case METHOD_ATTRIBUTE_FAM_AND_ASSEM:
                output += "internal ";
                break;
            case METHOD_ATTRIBUTE_FAM_OR_ASSEM:
                output += "protected internal ";
                break;
        }

        // static
        if (flags & METHOD_ATTRIBUTE_STATIC) {
            output += "static ";
        }

        // abstract / sealed override / virtual / override
        if (flags & METHOD_ATTRIBUTE_ABSTRACT) {
            output += "abstract ";
            if ((flags & METHOD_ATTRIBUTE_VTABLE_LAYOUT_MASK) == METHOD_ATTRIBUTE_REUSE_SLOT) {
                output += "override ";
            }
        } else if (flags & METHOD_ATTRIBUTE_FINAL) {
            if ((flags & METHOD_ATTRIBUTE_VTABLE_LAYOUT_MASK) == METHOD_ATTRIBUTE_REUSE_SLOT) {
                output += "sealed override ";
            }
        } else if (flags & METHOD_ATTRIBUTE_VIRTUAL) {
            if ((flags & METHOD_ATTRIBUTE_VTABLE_LAYOUT_MASK) == METHOD_ATTRIBUTE_NEW_SLOT) {
                output += "virtual ";
            } else {
                output += "override ";
            }
        }

        // extern
        if (flags & METHOD_ATTRIBUTE_PINVOKE_IMPL) {
            output += "extern ";
        }

        return output;
    }
}