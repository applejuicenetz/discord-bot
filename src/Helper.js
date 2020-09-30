class Helper {

    static formatNumber(value) {
        let newValue = value;
        if (value >= 1000) {
            let suffixes = ['', 'k', 'm', 'b', 't'];
            let suffixNum = Math.floor(('' + value).length / 3);
            let shortValue = '';
            for (let precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
                let dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                if (dotLessShortValue.length <= 2) {
                    break;
                }
            }
            if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
        }
        return newValue;
    }

    static formatBytes(bytes) {
        const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const thresh = 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        if (0 === parseInt(bytes)) {
            return bytes;
        }

        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
    }
}

module.exports = Helper;
