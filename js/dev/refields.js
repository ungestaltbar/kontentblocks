/*! kontentblocks DevVersion 2014-03-11 */
var KB = KB || {};

KB.Fields.register("Color", function($) {
    return {
        init: function() {
            $("body").on("mouseup", ".kb-field--color", function() {
                setTimeout(function() {
                    if (KB.FrontendEditModal) {
                        KB.FrontendEditModal.recalibrate();
                    }
                }, 150);
            });
            $(".kb-color-picker").wpColorPicker({
                change: function(event, ui) {},
                clear: function() {
                    pickColor("");
                }
            });
        },
        update: function() {
            this.init();
        }
    };
}(jQuery));

var KB = KB || {};

KB.Fields.register("Date", function($) {
    var settings = {};
    return {
        defaults: {
            format: "d M Y",
            offset: [ 0, 250 ],
            onSelect: function(selected, machine, Date, $el) {
                $(activeField).find(".kb-date-machine-format").val(machine);
                $(activeField).find(".kb-date-unix-format").val(Math.round(Date.getTime() / 1e3));
            }
        },
        init: function() {
            var that = this;
            _.each($(".kb-datepicker"), function(item) {
                var id = $(item).closest(".kb-field-wrapper").attr("id");
                if (id) {
                    settings = KB.FieldConfig[id] || {};
                }
                $(item).Zebra_DatePicker(_.extend(that.defaults, settings));
            });
        },
        update: function() {
            this.init();
        }
    };
}(jQuery));

var KB = KB || {};

KB.Fields.register("File", function($) {
    var self, attachment;
    self = {
        selector: ".kb-js-add-file",
        remove: ".kb-js-reset-file",
        container: null,
        init: function() {
            var that = this;
            $("body").on("click", this.selector, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.frame().open();
            });
            $("body").on("click", this.remove, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.resetFields();
            });
        },
        frame: function() {
            if (this._frame) return this._frame;
            this._frame = wp.media({
                title: KB.i18n.Refields.file.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: "application"
                }
            });
            this._frame.on("ready", this.ready);
            this._frame.state("library").on("select", this.select);
            return this._frame;
        },
        ready: function() {
            $(".media-modal").addClass(" smaller no-sidebar");
        },
        select: function() {
            attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
            $(".kb-file-filename", this.container).html(attachment.get("filename"));
            $(".kb-file-attachment-id", this.container).val(attachment.get("id"));
            $(".kb-file-title", this.container).html(attachment.get("title"));
            $(".kb-file-id", this.container).html(attachment.get("id"));
            $(".kb-file-editLink", this.container).attr("href", attachment.get("editLink"));
            $(this.remove, activeField).show();
            this.container.show(750);
        },
        resetFields: function() {
            $(".kb-file-attachment-id", this.container).val("");
            this.container.hide(750);
            $(this.remove, activeField).hide();
        },
        update: function() {
            this.init();
        }
    };
    return self;
}(jQuery));

var KB = KB || {};

KB.Fields.register("Image", function($) {
    "use strict";
    var self;
    self = {
        selector: ".kb-js-add-image",
        reset: ".kb-js-reset-image",
        _frame: null,
        $container: null,
        $wrapper: null,
        $id: null,
        $title: null,
        $caption: null,
        init: function() {
            var that = this;
            $("body").on("click", this.selector, function(e) {
                e.preventDefault();
                that.$container = $(".kb-field-image-container", activeField);
                that.$wrapper = $(".kb-field-image-wrapper", activeField);
                that.$id = $(".kb-js-image-id", that.$wrapper);
                that.$title = $(".kb-js-image-title", that.$wrapper);
                that.$caption = $(".kb-js-image-caption", that.$wrapper);
                that.openModal();
            });
        },
        frame: function() {
            if (this._frame) return this._frame;
        },
        openModal: function() {
            if (this._frame) {
                this._frame.open();
                return;
            }
            this._frame = wp.media({
                title: KB.i18n.Refields.image.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: "image"
                }
            });
            this._frame.state("library").on("select", this.select);
            return this._frame;
        },
        select: function() {
            var attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
            this.$container.html('<img src="' + attachment.get("sizes").thumbnail.url + '" >');
            this.$id.val(attachment.get("id"));
            this.$title.val(attachment.get("title"));
            this.$caption.val(attachment.get("caption"));
            $(document).trigger("KB:osUpdate");
        },
        update: function() {
            this.init();
        }
    };
    return self;
}(jQuery));