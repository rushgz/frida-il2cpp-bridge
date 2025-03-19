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
     * 根据标志位获取类型的修饰符（如 abstract、sealed、static）。
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
        // 判断是否是 sealed（非值类型且非枚举）
        else if (!is_valuetype && !is_enum && (flags & ATTRIBUTES.SEALED)) {
            modifiers += "sealed ";
        }

        return modifiers;
    }
}