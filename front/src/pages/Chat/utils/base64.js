var BASE64_MARKER = ';base64,';

function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () =>
			resolve(reader.result.replace(/data:image\/(.+);base64,( )?/, ''));
		reader.onerror = (error) => reject(error);
	});
}

function convertDataURIToBinary(dataURI) {
	var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	var base64 = dataURI.substring(base64Index);
	var raw = window.atob(base64);
	var rawLength = raw.length;
	var array = new Uint8Array(new ArrayBuffer(rawLength));

	for (let i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}
export { getBase64, convertDataURIToBinary };
