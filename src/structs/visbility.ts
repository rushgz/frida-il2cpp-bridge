// Visibility.ts
namespace Il2Cpp{
    export enum Visibility {
        Private = "private",
        Family = "protected", // 在 C# 中，`family` 对应 `protected`
        FamilyOrAssembly = "protected internal", // `fam_or_assem`
        FamilyAndAssembly = "private protected", // `fam_and_assem` (C# 7.2+)
        Public = "public",
        Internal = "internal", // 默认情况下，假设为 internal
    }

    export function getVisibility(flags: number): Visibility {
        flags = flags & 0x0007;
        if (flags & 0x0001) return Visibility.Private;
        if (flags & 0x0002) return Visibility.FamilyOrAssembly;
        if (flags & 0x0004) return Visibility.Family;
        if (flags & 0x0005) return Visibility.FamilyOrAssembly;
        if (flags & 0x0006) return Visibility.Public;
        return Visibility.Internal;
    }
}