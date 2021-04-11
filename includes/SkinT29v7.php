<?php
/**
 * This skin code is based on the Monobook novau skin.
 * Kind of Mediawiki-oldschool. Vector was too complicated for me.
 *
 * Started at 2021-04-11 by SvenK.
 *
 * @file
 * @ingroup Skins
 */

/**
 * Inherit main code from SkinTemplate, set the CSS and template filter.
 * @ingroup Skins
 */
class SkinMonoBook extends SkinTemplate {
	public $skinname = 't29v7';
	public $stylename = 'technikum29-v7';
	public $template = 'T29v7Template';

	/**
	 * @param OutputPage $out
	 */
	public function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );

		if ( $out->getUser()->getOption( 't29v7-responsive' ) ) {
			$out->addMeta( 'viewport',
				'width=device-width, initial-scale=1.0, ' .
				'user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0'
			);
			$styleModule = 'skins.t29v7.responsive';
			$out->addModules( [
				'skins.t29v7.mobile'
			] );

			if ( ExtensionRegistry::getInstance()->isLoaded( 'Echo' ) && $out->getUser()->isLoggedIn() ) {
				$out->addModules( [ 'skins.t29v7.mobile.echohack' ] );
			}
			if ( ExtensionRegistry::getInstance()->isLoaded( 'UniversalLanguageSelector' ) ) {
				$out->addModules( [ 'skins.t29v7.mobile.uls' ] );
			}
		} else {
			$styleModule = 'skins.t29v7.styles';
		}

		$out->addModuleStyles( [
			'mediawiki.skinning.content.externallinks',
			$styleModule
		] );
	}

	/**
	 * @param User $user
	 * @param array &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
        /*
		$preferences['t29v7-responsive'] = [
			'type' => 'toggle',
			'label-message' => 't29v7-responsive-label',
			'section' => 'rendering/skin/skin-prefs',
			// Only show this section when the Monobook skin is checked. The JavaScript client also uses
			// this state to determine whether to show or hide the whole section.
			'hide-if' => [ '!==', 'wpskin', 't29v7' ],
		];
		*/
	}

	/**
	 * Handler for ResourceLoaderRegisterModules hook
	 * Check if extensions are loaded
	 *
	 * @param ResourceLoader $resourceLoader
	 */
	public static function registerMobileExtensionStyles( ResourceLoader $resourceLoader ) { 
        /*
		if ( ExtensionRegistry::getInstance()->isLoaded( 'Echo' ) ) {
			$resourceLoader->register( 'skins.t29v7.mobile.echohack', [
				'localBasePath' => __DIR__ . '/..',
				'remoteSkinPath' => 'MonoBook',

				'targets' => [ 'desktop', 'mobile' ],
				'scripts' => [ 'resources/mobile-echo.js' ],
				'styles' => [ 'resources/mobile-echo.less' => [
					'media' => 'screen and (max-width: 550px)'
				] ],
				'dependencies' => [ 'oojs-ui.styles.icons-alerts', 'mediawiki.util' ],
				'messages' => [ 't29v7-notifications-link', 't29v7-notifications-link-none' ]
			] );
		}

		if ( ExtensionRegistry::getInstance()->isLoaded( 'UniversalLanguageSelector' ) ) {
			$resourceLoader->register( 'skins.t29v7.mobile.uls', [
				'localBasePath' => __DIR__ . '/..',
				'remoteSkinPath' => 'MonoBook',

				'targets' => [ 'desktop' ],
				'scripts' => [ 'resources/mobile-uls.js' ],
				'dependencies' => [ 'ext.uls.interface' ],
			] );
		}
		*/
	}
}
