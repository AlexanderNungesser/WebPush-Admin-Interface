
export default class GradientMap
{
    constructor(container_id, width, height)
    {
        this.container_id = container_id;
        this.elem_textMin = null;
        this.elem_textMax = null;
        this.elem_canvas = null;
        this.elem_container = null;
        this.elem_tableContainer = null;
        this.elem_btnAddColor = null;
        this.width = width;
        this.height = height;
    }

    /**
     * Creates all required elements as children of the parent element
     * which has the `container_id` specified in the constructor.
     */
    setup()
    {
        const thisRef = this;

        function createInputRow()
        {
            const elem_inputNumber = document.createElement('input');
            const elem_inputColor = document.createElement('input');
            const elem_removeBtn = document.createElement('button');
            const elem_div1 = document.createElement('div');
            const elem_div2 = document.createElement('div');
            const elem_div3 = document.createElement('div');
            const elem_grid = document.createElement('div');

            elem_inputNumber.classList.add('uk-input', 'uk-form-small');
            elem_inputNumber.type = 'number';

            elem_inputColor.classList.add('uk-input', 'uk-form-small');
            elem_inputColor.type = 'color';

            elem_removeBtn.classList.add('uk-button', 'uk-button-default', 'uk-button-small');
            elem_removeBtn.textContent = '-';
            elem_removeBtn.onclick = () => thisRef.elem_tableContainer.removeChild(elem_grid);

            elem_grid.setAttribute('uk-grid', '');
            elem_grid.classList.add('uk-grid-small');

            elem_div1.appendChild(elem_inputNumber);
            elem_div2.appendChild(elem_inputColor);
            elem_div3.appendChild(elem_removeBtn);
            elem_grid.appendChild(elem_div1);
            elem_grid.appendChild(elem_div2);
            elem_grid.appendChild(elem_div3);

            return elem_grid;
        }

        this.elem_container = document.getElementById(this.container_id);

        if(!this.elem_container)
        {
            throw Error(`Could not find element with id "${this.container_id}"`);
        }

        this.elem_textMin = document.createElement('div');
        this.elem_textMax = document.createElement('div');
        const elem_grid = document.createElement('div');
        this.elem_canvas = document.createElement('canvas');
        this.elem_tableContainer = document.createElement('div');
        this.elem_btnAddColor = document.createElement('button');

        this.elem_textMin.classList.add('uk-width-1-2@m', 'uk-text-small', 'uk-text-left');
        this.elem_textMax.classList.add('uk-width-1-2@m', 'uk-text-small', 'uk-text-right');

        this.elem_textMin.textContent = 'Min.';
        this.elem_textMax.textContent = 'Max.';

        elem_grid.setAttribute('uk-grid', '');

        this.elem_canvas.width = this.width;
        this.elem_canvas.height = this.height;

        this.elem_tableContainer.classList.add('uk-margin');

        this.elem_btnAddColor.classList.add('uk-button', 'uk-button-default', 'uk-button-small');
        this.elem_btnAddColor.textContent = 'Farbe hinzufügen';
        this.elem_btnAddColor.onclick = () => this.elem_tableContainer.appendChild(createInputRow());

        elem_grid.appendChild(this.elem_textMin);
        elem_grid.appendChild(this.elem_textMax);

        this.elem_container.appendChild(elem_grid);
        this.elem_container.appendChild(this.elem_canvas);
        this.elem_container.appendChild(this.elem_tableContainer);
        this.elem_container.appendChild(this.elem_btnAddColor);
    }

    /**
     * 
     * @returns MapData
     */
    getMapData()
    {
        const ret =
        {
            minVal: Number.MAX_VALUE,
            maxVal: Number.MIN_VALUE,
            gradient: []
        };

        for (const tr of this.elem_tableContainer.childNodes)
        {
            if(tr.nodeType !== Node.ELEMENT_NODE)
            {
                continue;
            }
            const value = tr.childNodes[0].firstChild.value;
            const color = tr.childNodes[1].firstChild.value;

            if(!value)
            {
                throw new Error('Invalid value');
            }

            const parsedVal = Number.parseFloat(value);
            if(parsedVal < ret.minVal)
            {
                ret.minVal = parsedVal;
            }
            else if(parsedVal > ret.maxVal)
            {
                ret.maxVal = parsedVal;
            }

            ret.gradient.push({
                value: parsedVal,
                color: color
            });
        }

        ret.gradient.sort((a, b) =>
        {
            return a.value - b.value
        });

        if(ret.gradient.length == 1)
        {
            ret.maxVal = ret.minVal;
        }

        return ret;
    }

    showPreview()
    {
        var ctx = this.getContext2d();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.width, this.height);

        this.elem_textMin.textContent = 'Min.';
        this.elem_textMax.textContent = 'Max.';

        const colorMap = this.getMapData();

        if(!colorMap || !colorMap.gradient || colorMap.gradient.length == 0)
        {
            return;
        }

        this.elem_textMin.textContent = colorMap.minVal;
        this.elem_textMax.textContent = colorMap.maxVal;

        // Create gradient
        var grd = ctx.createLinearGradient(0, 0, this.width, 0);

        for (const colorEntry of colorMap.gradient)
        {
            grd.addColorStop((colorEntry.value - colorMap.minVal) / (colorMap.maxVal - colorMap.minVal), colorEntry.color);
        }

        // Fill with gradient
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    getContext2d()
    {
        return this.elem_canvas.getContext('2d');
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
    }
}
