/**
 * @file NumberInput.jsx
 * @description Composant d'entrée numérique adapté aux enfants
 */

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { Icon } from "../common/Icon";
import { Button } from "../common/Button";

/**
 * Composant d'entrée numérique avec boutons d'incrémentation/décrémentation
 * @param {Object} props - Propriétés du composant
 * @param {string|number} [props.value=''] - Valeur actuelle
 * @param {Function} props.onChange - Fonction appelée lors du changement de valeur
 * @param {number} [props.min=0] - Valeur minimale
 * @param {number} [props.max=100] - Valeur maximale
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {Object} ref - Référence React transmise au composant
 * @returns {JSX.Element} Composant NumberInput
 */
export const NumberInput = forwardRef(
    (
        { value = "", onChange, min = 0, max = 100, className = "", ...rest },
        ref
    ) => {
        /**
         * Gère le changement de valeur
         * @param {Event} e - Événement de changement
         */
        const handleChange = (e) => {
            const newValue = e.target.value;

            // Vérifier si la valeur est un nombre valide
            if (newValue === "" || /^\d+$/.test(newValue)) {
                // Vérifier les limites min/max
                if (
                    newValue === "" ||
                    (parseInt(newValue, 10) >= min &&
                        parseInt(newValue, 10) <= max)
                ) {
                    onChange(newValue);
                }
            }
        };

        /**
         * Incrémente la valeur
         */
        const increment = () => {
            const currentValue = value === "" ? 0 : parseInt(value, 10);
            if (currentValue < max) {
                onChange(String(currentValue + 1));
            }
        };

        /**
         * Décrémente la valeur
         */
        const decrement = () => {
            const currentValue = value === "" ? 0 : parseInt(value, 10);
            if (currentValue > min) {
                onChange(String(currentValue - 1));
            }
        };

        return (
            <div className="flex items-center">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={decrement}
                    disabled={value === "" || parseInt(value, 10) <= min}
                    className="rounded-r-none"
                    aria-label="Diminuer"
                >
                    <Icon name="minus" />
                </Button>

                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={handleChange}
                    ref={ref}
                    className={`py-2 px-3 border border-gray-300 text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
                    {...rest}
                />

                <Button
                    type="button"
                    variant="secondary"
                    onClick={increment}
                    disabled={value !== "" && parseInt(value, 10) >= max}
                    className="rounded-l-none"
                    aria-label="Augmenter"
                >
                    <Icon name="plus" />
                </Button>
            </div>
        );
    }
);

NumberInput.displayName = "NumberInput";

NumberInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    className: PropTypes.string,
};
