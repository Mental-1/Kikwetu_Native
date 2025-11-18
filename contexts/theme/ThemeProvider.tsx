
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import { Colors } from '@/src/constants/constant';


const LightTheme = {
    background: Colors.background,
    text: Colors.black,
    primary: Colors.primary,
    grey: Colors.grey,
    lightgrey: Colors.lightgrey,
    white: Colors.white,
    red: Colors.red,
    green: Colors.green,
    badgeRed: Colors.badgeRed,
};

const DarkTheme = {
    background: Colors.darkgrey, 
    text: Colors.white,
    primary: Colors.primary,
    grey: Colors.lightgrey, 
    lightgrey: Colors.grey, 
    white: Colors.black, 
    red: Colors.red,
    green: Colors.green,
    badgeRed: Colors.badgeRed,
};

export const ThemeContext = createContext({
    isDarkMode: false,
    theme: LightTheme,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorScheme = Appearance.getColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setIsDarkMode(colorScheme === 'dark');
        });
        return () => subscription.remove();
    }, []);

    const theme = isDarkMode ? DarkTheme : LightTheme;

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
