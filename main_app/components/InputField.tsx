import React, { useState } from "react";
import { XStack, Input, Label, View, Button, Text } from "tamagui";
import DateTimePicker from '@react-native-community/datetimepicker';
import Calenda from "~/assets/icons/Calenda";
import { Image } from "expo-image";

type InputType = 'text' | 'password' | 'date';

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    type?: InputType;
    onChange: (value: string) => void;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    value,
    type = 'text',
    onChange,
    error,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
        }
    };

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderInputContent = () => {
        switch (type) {
            case 'date':
                return (
                    <>
                        <Button
                            onPress={() => setShowDatePicker(true)}
                            width="100%"
                            height={60}
                            borderRadius={15}
                            pressStyle={{ backgroundColor: "white" }}
                            borderWidth={0}
                            paddingLeft={20}
                            paddingRight={50}
                            color="black"
                            backgroundColor="white"
                            
                            
                        >
                            <Text color={value ? "black" : "#999999"} fontSize={16} w={"100%"} textAlign="left">
                                {formatDateForDisplay(value) || label}
                            </Text>
                        </Button>
                        <View position="absolute" right={15}>
                            <Calenda
                                width={24}
                                height={24}
                                color={showDatePicker ? "#E94057" : "#999999"}
                                onPress={() => setShowDatePicker(true)}
                            />
                        </View>
                        {showDatePicker && (
                            <DateTimePicker
                                value={value ? new Date(value) : new Date()}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                                minimumDate={new Date(1900, 0, 1)}
                                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                            />
                        )}
                    </>
                );
            case 'password':
                return (
                    <>
                        <Input
                            id={id}
                            placeholder={label}
                            secureTextEntry={!showPassword}
                            onChangeText={onChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            width="100%"
                            height={60}
                            borderRadius={15}
                            value={value}
                            borderWidth={0}
                            paddingLeft={20}
                            paddingRight={50}
                            color="black"
                            backgroundColor="white"
                            fontSize={15}
                        />
                        <Button
                            position="absolute"
                            right={0}
                            onPress={() => setShowPassword(!showPassword)}
                            backgroundColor="transparent"
                            pressStyle={{ backgroundColor: "transparent" }}
                            borderWidth={0}
                        >
                            <Image
                                source={showPassword ? 
                                    require("~/assets/icons/eye-off.svg") :
                                    require("~/assets/icons/eye.svg")
                                }
                                style={{width: 24, height: 24}}
                            />
                        </Button>
                    </>
                );
            default:
                return (
                    <Input
                        id={id}
                        placeholder={label}
                        onChangeText={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        width="100%"
                        height={60}
                        borderRadius={15}
                        value={value}
                        borderWidth={0}
                        paddingLeft={20}
                        color="black"
                        backgroundColor="white"
                        fontSize={15}
                    />
                );
        }
    };

    return (
        <View width="100%" marginBottom={15}>
            <XStack
                width="100%"
                borderColor={error ? "#FF0000" : isFocused || showDatePicker ? "#E94057" : "#E8E6EA"}
                borderWidth={1.5}
                borderRadius={15}
                alignItems="center"
            >
                {(isFocused || value) && (
                    <Label
                        htmlFor={id}
                        color={error ? "#FF0000" : isFocused ? "#E94057" : "#999999"}
                        position="absolute"
                        zIndex={5}
                        left={20}
                        top={-13}
                        backgroundColor="white"
                        paddingHorizontal={10}
                    >
                        {label}
                    </Label>
                )}
                {renderInputContent()}
            </XStack>
            {error && (
                <Text color="#FF0000" fontSize={12} marginTop={5} marginLeft={20}>
                {error}
            </Text>
            )}
        </View>
    );
};

export default InputField;