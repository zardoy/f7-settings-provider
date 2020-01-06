// type SettingsItemTypes = "text" | "link" | "switch" | "input" | "textarea" | "email" | "stepper" | "phone" | "color";

type PossibleSettingTypes = {
    type: "text",
    text: string
} | {
    type: "link",
    href: string
} | {
    type: "switch",
    defaultActive: boolean
}
    // type: "input" | "textarea" | "email",
    // defaultValue: string
// } | {
//     type: "stepper",
//     defaultValue: number
//     min?: number
//     max?: number
// }

interface SettingGeneralParams {
    /** Title of the setting */
    text: string,
    /** Define your tags here */
    tags?: string[],
    /** Enable this to disable feature and ignore user setting. (default false) */
    disabled?: boolean,
    /** Hint text will be shown as block footer elem below the setting */
    // hint?: string,
    /** This function will be executed when setting state is changed. Try to avoid this in favor global saver */
    // onStateChange?: (newState: any) => boolean,
    /** React element that will be shown as media slot in list item */
    // mediaIcon?: React.ReactChild,
    /** Additional class name that will be added to list item element */
    // className?: React.ReactChild,
    /** Confirm dialog that will be shown before the state of the setting getting changed */
    // confirmDialog?: {
    //     title: string,
    //     message: string,
    //     okButton: string,
    //     okButtonType?: "default" | "destructive"
    // }
}

export interface SettingsScheme {
    [listName: string]: {
        title?: string,
        items: {
            [settingID: string]: PossibleSettingTypes & SettingGeneralParams
        }
    }
}