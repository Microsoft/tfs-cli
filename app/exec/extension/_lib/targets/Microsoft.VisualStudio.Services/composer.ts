import { ExtensionComposer } from "../../extension-composer";
import { ManifestBuilder } from "../../manifest";
import { VsixComponents } from "../../merger";
import { VsoManifestBuilder } from "./vso-manifest-builder";
import { VsixManifestBuilder } from "../../vsix-manifest-builder";
import Q = require("q");

export class VSSExtensionComposer extends ExtensionComposer {

	public static SupportLink = "Microsoft.VisualStudio.Services.Links.Support";

	public getBuilders(): ManifestBuilder[] {
		return super.getBuilders().concat([new VsoManifestBuilder(this.settings.root)]);
	}

	public validate(components: VsixComponents): Promise<string[]> {
		return super.validate(components).then((result) => {
			let data = components.builders.filter(b => b.getType() === VsoManifestBuilder.manifestType)[0].getData();
			if (data.contributions.length === 0 && data.contributionTypes.length === 0) {
				result.push("Your extension must define at least one contribution or contribution type.");
			}
			data = components.builders.filter(b => b.getType() === VsixManifestBuilder.manifestType)[0].getData();
			let galleryFlags = data.PackageManifest.Metadata[0].GalleryFlags;
			let properties = data.PackageManifest.Metadata[0].Properties;

			if (galleryFlags && galleryFlags[0] && galleryFlags[0].toLowerCase().includes("paid")) {
				if (properties && properties.length > 0) {
					let property = properties[0].Property.filter(prop => prop.$.Id === VSSExtensionComposer.SupportLink && prop.$.Value)
					if (!property) {
						result.push("Paid extensions are required to have a support link. Try adding it to your manifest: { \"links\": { \"support\": \"<support url>\" } }");
					}
				}
				else {
					result.push("Paid extensions are required to have a support link. Try adding it to your manifest: { \"links\": { \"support\": \"<support url>\" } }");
				}
			}

			return Q.resolve(result);
		});
	}
}