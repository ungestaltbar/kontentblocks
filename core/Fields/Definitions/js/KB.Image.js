var KB = KB || {};

KB.Fields.register('Image', (function ($) {
    'use strict';
    var self;

    self = {
        selector: '.kb-js-add-image',
        reset: '.kb-js-reset-image',
        _frame: null,
        $container: null,
        $wrapper: null,
        $id: null,
        $title: null,
        $caption: null,
        init: function () {
            var that = this;
            $('body').on('click', this.selector, function (e) {
                e.preventDefault();
                that.settings = that.getSettings(this);
                that.$container = $('.kb-field-image-container', activeField);
                that.$wrapper = $('.kb-field-image-wrapper', activeField);
                that.$id = $('.kb-js-image-id', that.$wrapper);
                that.$title = $('.kb-js-image-title', that.$wrapper);
                that.$caption = $('.kb-js-image-caption', that.$wrapper);
                that.openModal();
            });

        },
        getSettings: function (el) {
            var parent = $(el).closest('.kb-field-wrapper');
            var id = parent.attr('id');
            if (KB.fromServer.Fields[id]) {
                return KB.fromServer.Fields[id];
            }
        },
        frame: function () {
            if (this._frame)
                return this._frame;
        },
        openModal: function () {

            // opens dialog if not already declared
            if (this._frame) {
                this._frame.open();
                return;
            }

            this._frame = wp.media({
                // Custom attributes
                title: KB.i18n.Refields.image.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: 'image'
                }
            });

            this._frame.state('library').on('select', this.select);
            this._frame.open();
            return this._frame;

        },
        select: function () {
            var attachment = this.get('selection').first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function (attachment) {
            var that = this;
            var url, args;

            if (this.settings && this.settings.previewSize) {

                args = {
                    width: this.settings.previewSize[0],
                    height: this.settings.previewSize[1],
                    crop: true,
                    upscale: false
                };

                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "fieldGetImage",
                        args: args,
                        id: attachment.get('id'),
                        _ajax_nonce: kontentblocks.nonces.get
                    },
                    type: "GET",
                    dataType: "json",
                    success: function(res) {
                        that.$container.html('<img src="' + res + '" >');
                    },
                    error: function() {}
                });
            } else {
                this.$container.html('<img src="' + attachment.get('sizes').thumbnail.url + '" >');
            }
            this.$id.val(attachment.get('id'));
            this.$title.val(attachment.get('title'));
            this.$caption.val(attachment.get('caption'));
            $(document).trigger('KB:osUpdate');

        },
        update: function () {
            this.init();
        }
    };
    return self;


}(jQuery)));