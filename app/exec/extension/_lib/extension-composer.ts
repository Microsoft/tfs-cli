import { ManifestBuilder } from "./manifest";
import { MergeSettings } from "./interfaces";
import { VsixManifestBuilder } from "./vsix-manifest-builder";
import { VsixComponents } from "./merger";
import _ = require("lodash");

export abstract class ExtensionComposer {
    constructor(protected settings: MergeSettings) {}

    public getBuilders(): ManifestBuilder[] {
        return [new VsixManifestBuilder(this.settings.root)];
    }

    /**
     * Return a string[] of validation errors
     */
    public validate(components: VsixComponents): Promise<string[]> {
        // Take the validators and run each's method against the vsix manifest's data
        let errorMessages = Object.keys(ExtensionComposer.vsixValidators)
            .map(path =>
                ExtensionComposer.vsixValidators[path](
                    _.get(components.builders.filter(b => b.getType() === VsixManifestBuilder.manifestType)[0].getData(), path),
                ),
            )
            .filter(r => !!r);

        return Promise.resolve(errorMessages);
    }

    // Basic/global extension validations.
    private static vsixValidators: { [path: string]: (value) => string } = {
        "PackageManifest.Metadata[0].Identity[0].$.Id": value => {
            if (/^[A-z0-9_-]+$/.test(value)) {
                return null;
            } else {
                return "'extensionId' may only include letters, numbers, underscores, and dashes.";
            }
        },
        "PackageManifest.Metadata[0].Identity[0].$.Version": value => {
            if (typeof value === "string" && value.length > 0) {
                return null;
            } else {
                return "'version' must be provided.";
            }
        },
        "PackageManifest.Metadata[0].Description[0]._": value => {
            if (!value || value.length <= 200) {
                return null;
            } else {
                return "'description' must be less than 200 characters.";
            }
        },
        "PackageManifest.Metadata[0].DisplayName[0]": value => {
            if (typeof value === "string" && value.length > 0) {
                return null;
            } else {
                return "'name' must be provided.";
            }
        },
        "PackageManifest.Assets[0].Asset": value => {
            let usedAssetTypes = {};
            if (_.isArray<any>(value)) {
                for (let i = 0; i < value.length; ++i) {
                    let asset = value[i].$;
                    if (asset) {
                        if (!asset.Path) {
                            return "All 'files' must include a 'path'.";
                        }
                        if (asset.Type && asset.Addressable) {
                            if (usedAssetTypes[asset.Type + "|" + asset.Lang]) {
                                return (
                                    "Cannot have multiple 'addressable' files with the same 'assetType'.\nFile1: " +
                                    usedAssetTypes[asset.Type + "|" + asset.Lang] +
                                    ", File 2: " +
                                    asset.Path +
                                    " (asset type: " +
                                    asset.Type +
                                    ")"
                                );
                            } else {
                                usedAssetTypes[asset.Type + "|" + asset.Lang] = asset.Path;
                            }
                        }
                    }
                }
            }

            return null;
        },
        "PackageManifest.Metadata[0].Identity[0].$.Publisher": value => {
            if (typeof value === "string" && value.length > 0) {
                return null;
            } else {
                return "'publisher' must be provided.";
            }
        },
        "PackageManifest.Metadata[0].Categories[0]": value => {
            if (!value) {
                return null;
            }
            let categories = value.split(",");
            let validCategories = [
                "Build and release",
                "Collaborate",
                "Code",
                "Test",
                "Plan and track",
                "Insights",
                "Integrate",
                "Developer samples",
            ];
            _.remove(categories, c => !c);
            let badCategories = categories.filter(c => validCategories.indexOf(c) < 0);
            return badCategories.length
                ? "The following categories are not valid: " +
                      badCategories.join(", ") +
                      ". Valid categories are: " +
                      validCategories.join(", ") +
                      "."
                : null;
        },
        "PackageManifest.Installation[0].InstallationTarget": value => {
            if (_.isArray(value) && value.length > 0) {
                return null;
            }
            // We check for InstallationTarget in extension-composer-factory for now. This might change in the future.
            return null; //"Your manifest must include at least one 'target'.";
        },
    };
}
