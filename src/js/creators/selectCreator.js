export default class SelectCreator {
    getOptionTmpl(optionValue, optionName) {
        return `
            <option value=${optionValue} >${optionName}</option>
        `;
    }

    createSelect(selectName, optionsObj, isDisabledDefaultOption) {
        const select = document.createElement('select');
        select.setAttribute('id', selectName);
        select.setAttribute('name', selectName);
        select.className = 'form__input';

        const options = Object.keys(optionsObj).sort((a, b) => {
            const nameA = optionsObj[a].toLowerCase();
            const nameB = optionsObj[b].toLowerCase();

            return (nameA < nameB) ? -1 : 1;
        });

        let optionsHtml = isDisabledDefaultOption
            ? ''
            : this.getOptionTmpl('', `All ${selectName}`);

        select.innerHTML = options.reduce((acc, option) => {
            const html = acc + this.getOptionTmpl(option, optionsObj[option]);
            return html;
        }, optionsHtml);

        return select;
    }
}
