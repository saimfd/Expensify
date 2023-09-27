import {useState, useEffect, useContext} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import CONST from '../../CONST';
import {PreferredThemeContext} from '../../components/OnyxProvider';

// TODO: Remove this once "OnyxProvider" is typed
type PreferredThemeContextType = React.Context<(typeof CONST.THEME)[keyof typeof CONST.THEME]>;

type ThemePreference = typeof CONST.THEME.LIGHT | typeof CONST.THEME.DARK;

function useThemePreference() {
    const [themePreference, setThemePreference] = useState<ThemePreference>(CONST.THEME.DEFAULT);
    const [systemTheme, setSystemTheme] = useState<ColorSchemeName>();
    const preferredThemeFromStorage = useContext(PreferredThemeContext as PreferredThemeContextType);

    useEffect(() => {
        // This is used for getting the system theme, that can be set in the OS's theme settings. This will always return either "light" or "dark" and will update automatically if the OS theme changes.
        const systemThemeSubscription = Appearance.addChangeListener(({colorScheme}) => setSystemTheme(colorScheme));
        return () => systemThemeSubscription.remove();
    }, []);

    useEffect(() => {
        const theme = preferredThemeFromStorage || CONST.THEME.DEFAULT;

        // If the user chooses to use the device theme settings, we need to set the theme preference to the system theme
        if (theme === CONST.THEME.SYSTEM) {
            setThemePreference(systemTheme ?? CONST.THEME.DEFAULT);
        } else {
            setThemePreference(theme);
        }
    }, [preferredThemeFromStorage, systemTheme]);

    return themePreference;
}

export default useThemePreference;
