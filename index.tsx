import React, { useContext, useEffect, useState, useMemo, useReducer, useCallback } from "react";
import { SettingsScheme } from "./types";
import List from "framework7-react/components/list";
import ListItem from "framework7-react/components/list-item";
import Toggle from "framework7-react/components/toggle";
import BlockTitle from "framework7-react/components/block-title";

const SettingsContext = React.createContext({
    settingsScheme: null as SettingsScheme,
    settingsMergedValues: null as UserSettings,
    updateUserSettings: null as (newUserSettings: UserSettings, replaceSettings?: boolean) => void
});

interface UserSettings {
    [settingID: string]: any
}

interface SettingsProviderProps {
    settingsScheme: SettingsScheme,
    onSaveSettings: (userSettings: UserSettings, settingsScheme: SettingsScheme) => void,
    userSettings?: UserSettings
}

//TODO: compare default values with user values for better optimization

let SettingsProvider: React.FC<SettingsProviderProps> = ({ settingsScheme, userSettings, children, onSaveSettings }) => {
    let [userSettingsState, setUserSettings] = useState({});

    useMemo(() => {
        setUserSettings(userSettings || {});
    }, [userSettings]);

    const updateUserSettings = useCallback((newUserSettings: UserSettings, replaceSettings: boolean) => {
        if (replaceSettings) {
            setUserSettings(newUserSettings);
        } else {
            let mergedUserSettings = { ...userSettingsState, ...newUserSettings };
            setUserSettings(mergedUserSettings);
            onSaveSettings(mergedUserSettings, settingsScheme);
        }
    }, [userSettingsState, onSaveSettings, settingsScheme]);

    let contextValue = useMemo((): React.ContextType<typeof SettingsContext> => ({
        settingsScheme,
        settingsMergedValues: mergeUserSettings(settingsScheme, userSettingsState),
        updateUserSettings
    }), [settingsScheme, userSettingsState, updateUserSettings]);

    return <SettingsContext.Provider value={contextValue}>
        {children}
    </SettingsContext.Provider>;
}

SettingsProvider = React.memo(SettingsProvider);

SettingsProvider.displayName = "F7-settings-provider";

interface SettingsListProps {
    listName: string,
    listTitleOverride?: string
}

let SettingsList: React.FC<SettingsListProps> = ({ listName, listTitleOverride }) => {
    let { settingsScheme, settingsMergedValues, updateUserSettings } = useSettingsContext();

    let settingsList = settingsScheme[listName];

    let listTitle = listTitleOverride || settingsList.title || null;

    return <>
        {listTitle !== null && <BlockTitle>{listTitle}</BlockTitle>}
        <List>
            {
                Object.entries(settingsList.items).map(([settingID, settingParams]) => (
                    settingParams.type === "switch" ? <ListItem key={settingID} title={settingParams.text}>
                        <Toggle
                            slot="after"
                            defaultChecked={settingsMergedValues[settingID]}
                            // TODO
                            onToggleChange={state => updateUserSettings({ [settingID]: state }, false)}
                            disabled={settingParams.disabled}
                        />
                    </ListItem> :
                        settingParams.type === "link" || settingParams.type === "text" ? <ListItem title={settingParams.text} link={settingParams.type === "link" && "#"} /> : null
                ))
            }
        </List>
    </>;
}

SettingsList = React.memo(SettingsList);

SettingsList.displayName = "f7-settings-list";

const useSettingValue = (settingID: string, defaultValue?: string) => {
    let { settingsMergedValues } = useContext(SettingsContext);
    let settingValue = settingsMergedValues[settingID];
    if (settingValue === undefined) {
        if (defaultValue !== undefined) return defaultValue;
        else throw new Error("f7-settings-provider: Can't find setting with ID " + settingID);
    } else {
        return settingsMergedValues[settingID];
    }
}

const useSettingsContext = () => {
    return useContext(SettingsContext);
}

export { SettingsProvider, SettingsList, useSettingsContext, useSettingValue };

// const mergeUserSettings = async (srcSettings: SettingsList, userSettings: UserSettings) => {
//     return Object.entries(srcSettings).reduce(async (prevPromise, [, settingsList]) => {
//         let prevList = await prevPromise;
//         let listParams = await Object.entries(settingsList.items).reduce(
//             async (prevPromise, [settingID, settingParams]) => {
//                 let prevSetting = await prevPromise;
//                 let currentSettingValue = userSettings[settingID] || settingParams.defaultValue;
//                 return { ...prevSetting, [settingID]: currentSettingValue };
//             },
//             Promise.resolve({})
//         )
//         return { ...prevList, ...listParams };
//     }, Promise.resolve({}));
// }

const mergeUserSettings = (srcSettings: SettingsScheme, userSettings: UserSettings): UserSettings => {
    const getSettingValue = (settingID: string, settingParams: SettingsScheme[""]["items"][""]) => {
        if (settingParams.type === "text" || settingParams.type === "link") return null;
        let userSettingValue = settingParams.disabled ? null : userSettings[settingID];
        if (settingParams.type === "switch") {
            return userSettingValue || settingParams.defaultActive;
        }
        //  else {
        //     return userSetting || settingParams.defaultValue;
        // }
    }

    return Object.entries(srcSettings).reduce((prevList, [, settingsList]) => {
        let listParams = Object.entries(settingsList.items).reduce(
            (prevSettings, [settingID, settingParams]) => {
                let settingValue = getSettingValue(settingID, settingParams);
                if (settingValue === null) return prevSettings;
                return { ...prevSettings, [settingID]: settingValue };
            }, {}
        )
        return { ...prevList, ...listParams };
    }, {});
}