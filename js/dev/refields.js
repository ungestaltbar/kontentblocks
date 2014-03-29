/*! Kontentblocks DevVersion 2014-03-29 */
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
                that.settings = that.getSettings(this);
                that.$container = $(".kb-field-image-container", activeField);
                that.$wrapper = $(".kb-field-image-wrapper", activeField);
                that.$id = $(".kb-js-image-id", that.$wrapper);
                that.$title = $(".kb-js-image-title", that.$wrapper);
                that.$caption = $(".kb-js-image-caption", that.$wrapper);
                that.openModal();
            });
        },
        getSettings: function(el) {
            var parent = $(el).closest(".kb-field-wrapper");
            var id = parent.attr("id");
            if (KB.payload.Fields && KB.payload.Fields[id]) {
                return KB.payload.Fields[id];
            }
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
            this._frame.open();
            return this._frame;
        },
        select: function() {
            var attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
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
                        id: attachment.get("id"),
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
                this.$container.html('<img src="' + attachment.get("sizes").thumbnail.url + '" >');
            }
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

var KB = KB || {};

KB.MultipleImageText = function(view) {
    this.view = view;
    this.view.on("kb:frontend::viewLoaded", _.bind(this.viewLoaded, this));
    this.view.on("kb:backend::viewUpdated", this.listen);
    this.view.on("kb:frontend::viewUpdated", _.bind(this.listen, this));
    this.view.on("kb:viewAdded", _.bind(this.preInit, this));
};

_.extend(KB.MultipleImageText.prototype, {
    preInit: function() {
        _K.log("MultipleImageText preInit called");
        $ = jQuery;
        this.defaults = {
            content: "",
            imgid: null,
            imgsrc: null,
            label: ""
        };
        this.elCount = 0;
        this.$wrapper = $(".kb-field--wrap", this.view.$el);
        this.$list = $(".kb-generic--list", this.$wrapper);
        this.$parentEl = this.view.$el;
        this.selector = ".kb-js--generic-create-item";
        this.template = $(".template", this.$wrapper).html();
        this.instance_id = this.view.model.get("instance_id");
        this.init();
    },
    init: function() {
        var that = this;
        this.$list.on("mouseover", ".kb-generic--list-item", function() {
            that.$currentItem = jQuery(this);
        });
        this.$wrapper.on("click", this.selector, function() {
            that.addItem();
        });
        this.$wrapper.on("click", ".kb-js-generic-toggle", function() {
            jQuery(this).not("input").next().slideToggle(350, function() {
                if (KB.FrontendEditModal) {
                    KB.FrontendEditModal.recalibrate();
                }
            });
        });
        this.$wrapper.on("click", ".kb-js-add-custom", function() {
            that.$imgid = $(".kb-js-generic--imgid", that.$currentItem);
            that.$imgwrap = $(".kb-generic--image-wrapper", that.$currentItem);
            if (that.modal) {
                that.modal.open();
            } else {
                that.modal = KB.Utils.MediaWorkflow({
                    select: _.bind(that.select, that),
                    buttontext: "Insert",
                    title: "Insert or upload an image"
                });
            }
        });
        this.$wrapper.on("click", ".kb-js-generic--delete", function(e) {
            $(e.currentTarget).closest(".kb-generic--list-item").hide(150).remove();
        });
        this.initialSetup();
    },
    initialSetup: function() {
        var that = this;
        var mid = this.view.model.get("instance_id");
        if (!KB.payload.fieldData) {
            return false;
        }
        var data = KB.payload.fieldData["mltpl-image-text"] ? KB.payload.fieldData["mltpl-image-text"][mid] : [];
        _.each(data, function(item) {
            that.addItem(item);
        });
        $(".kb-generic--list").sortable({
            handle: ".kb-js-generic--move",
            stop: function() {
                KB.TinyMCE.restoreEditors();
            },
            start: function() {
                KB.TinyMCE.removeEditors();
            }
        });
    },
    addItem: function(data, index) {
        var moduleData = data || _.extend(this.defaults, this.view.model.get("moduleData"));
        this.count = index || jQuery(".kb-generic--list-item", this.$list).length;
        this.$list.append(_.template(this.template, _.extend({
            base: this.instance_id,
            counter: this.count
        }, moduleData)));
        var $el = jQuery(".kb-generic--list-item", this.$list).last().find(".kb-remote-editor");
        var editorName = $el.attr("data-name");
        KB.TinyMCE.remoteGetEditor($el, editorName, $el.html(), this.view.model.get("post_id"), false);
        jQuery(".kb-generic-tabs").tabs();
    },
    viewLoaded: function(externalView) {
        if (externalView) {
            this.view = externalView;
        }
        this.preInit();
        KB.FrontendEditModal.recalibrate();
    },
    select: function(modal) {
        var attachment = modal.get("selection").first();
        var url = attachment.get("sizes").large;
        this.$imgid.val(attachment.get("id"));
        this.$imgwrap.empty().append('<img src="' + url.url + '" >');
    },
    listen: function() {
        $(window).trigger("resize");
        initFlicker(this.view.parentView.el);
    }
});

(function($) {
    return {
        init: function() {
            var that = this;
            if (KB.appData && !KB.appData.config.loggedIn) {
                return;
            }
            KB.on("kb:Module_MultipleImageText:added", function(view) {
                view.MIT = new KB.MultipleImageText(view);
                view.MIT.preInit.call(view.MIT);
            });
            KB.on("kb:Module_MultipleImageText:loaded", function(view) {
                view.MIT = new KB.MultipleImageText(view);
                view.MIT.preInit.call(view.MIT);
            });
            KB.on("kb:Module_MultipleImageText:loadedOnFront", function(view) {
                view.MIT = new KB.MultipleImageText(view);
            });
        }
    };
})(jQuery).init();

function initFlicker(scope) {
    jQuery(".flicker", jQuery(scope)).flicker({
        arrows: true,
        auto_flick: false,
        auto_flick_delay: 10,
        dot_navigation: true,
        block_text: false,
        flick_animation: "transition-slide",
        theme: "light"
    });
}

jQuery(document).ready(function($) {
    if (KB.appData && KB.appData.config.frontend) {
        initFlicker("body");
    }
});