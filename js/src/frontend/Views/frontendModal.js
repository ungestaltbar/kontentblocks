/**
 * This is the modal which wraps the modules input form
 * and loads when the user clicks on "edit" while in frontend editing mode
 * @type {*|void|Object}
 */
KB.Backbone.FrontendEditView = Backbone.View.extend({
    // cache for the outer form jQuery object
    $form: null,
    // cache for the inner form jQuery object
    $formContent: null,
    // timer handle for delayed keyup events
    timerId: null,
    // init
    initialize: function (options) {
        var that = this;
        this.options = options;
        // the actual frontend module view
        this.view = options.view;
        this.model.on('change', this.test, this);

        this.listenTo(this.view, 'template::changed', function () {
            that.serialize(false);
            that.render();
        });

        this.listenTo(this.view, 'kb:moduleUpdated', function () {
            that.$el.removeClass('isDirty');
//            that.reload(that.view);
        });

        // @TODO events:make useless
        this.listenTo(KB, 'frontend::recalibrate', this.recalibrate);

        // use this event to refresh the modal
        this.listenTo(KB.Events, 'KB::edit-modal-refresh', this.recalibrate);

        // @TODO events:make useless
        this.listenTo(this, 'recalibrate', this.recalibrate);
        // add form skeleton to modal
        jQuery(KB.Templates.render('frontend/module-edit-form', {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);

        // cache elements
        this.$form = jQuery('#onsite-form', this.$el);
        this.$formContent = jQuery('#onsite-content', this.$el);
        this.$inner = jQuery('.os-content-inner', this.$formContent);

        // init draggable container and store position in config var
        this.$el.css('position', 'fixed').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function (eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                // fit modal to window in size and position
                that.recalibrate(ui.position);
            }
        });

        // Attach resize event handler
        jQuery(window).on('resize', function () {
            that.recalibrate();
        });

        // restore position if saved coordinates are around
        if (KB.OSConfig.wrapPosition) {
            this.$el.css({
                top: KB.OSConfig.wrapPosition.top,
                left: KB.OSConfig.wrapPosition.left
            });
        }

        // handle dynamically loaded tinymce instances
        // TODO find better context
        this.listenTo(KB.Events, 'KB::tinymce.new-editor', function (ed) {
            // live setting
            if (ed.settings && ed.settings.kblive) {
                that.attachEditorEvents(ed);
            }
        });

        // attach generic event listener for serialization
        jQuery(document).on('KB:osUpdate', function () {
            that.serialize(false);
        });

        // attach event listeners on observable input fields
        jQuery(document).on('change', '.kb-observe', function () {
            that.serialize(false);
        });

        // append modal to body
        jQuery('body').append(this.$el);
        this.$el.hide();
//        load the form
        this.render();
    },

    test: function () {
//        this.reload(this.view);
    },
// TODO move above event listeners here
    events: {
        'keyup': 'delayInput',
        'click a.close-controls': 'destroy',
        'click a.kb-save-form': 'update',
        'click a.kb-preview-form': 'preview'
    },
    preview: function () {
        this.serialize(false);
    },
    update: function () {
        this.serialize(true);
    },
    render: function () {
        var that = this;
        // apply settings for the modal from the active module, if any

        this.applyControlsSettings(this.$el);

        // update reference var
        KB.lastAddedModule = {
            view: that
        };

        // get the form
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'getModuleOptions',
                module: that.model.toJSON(),
                _ajax_nonce: kontentblocks.nonces.read
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {

                that.$inner.empty();
                that.view.clearFields();
                that.$inner.attr('id', that.view.model.get('instance_id'));
                // append the html to the inner form container
                that.$inner.append(res.html);
                that.$el.fadeTo(750, 0.1);

                // (Re)Init UI widgets
                // TODO find better method for this
                if (res.json) {
                    var merged = _.extend(KB.payload, res.json);
                    KB.payload = merged;
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor();
                // Inform fields that they were loaded
                var localView = _.clone(that.view);
                localView.$el = that.$inner;
                localView.parentView = that.view;
                that.view.trigger('kb:frontend::viewLoaded', localView);
                _K.info('Frontend Modal opened with view of:' + that.view.model.get('instance_id'));

                setTimeout(function () {
                    KB.Fields.trigger('frontUpdate', localView);
                }, 500);

                // Make the modal fit
                setTimeout(function () {
                    that.recalibrate();
                    that.$el.fadeTo(300, 1);

                }, 600);


            },
            error: function () {
                // TODO Error message
                console.log('e');
            }
        });
    },

    reload: function (moduleView) {
        var that = this;
        _K.log('Frontend Modal reload');
        this.unload();
        if (this.model && (this.model.get('instance_id') === moduleView.model.get('instance_id'))) {
            return false;
        }
        this.model = moduleView.model;
        this.options.view = moduleView;
        this.view = moduleView;
        this.$el.fadeTo(250,0.1, function(){
            that.render();

        });
    },

    unset: function () {
        this.model = null;
        this.options.view = null;
        this.view.attachedFields = {};
    },

// position and height of the modal may change depending on user action resp. contents
// if the contents fits easily,  modal height will be set to the minimum required height
// if contents take too much height, modal height will be set to maximum possible height
// Scrollbars are added as necessary

    recalibrate: function (pos) {

        var winH, conH, position, winDiff;

        // get window height
        winH = (jQuery(window).height()) - 40;
        // get height of modal contents
        conH = jQuery('.os-content-inner').height();
        //get position of modal
        position = this.$el.position();

        // calculate if the modal contents overlap the window height
        // i.e. if part of the modal is out of view
        winDiff = (conH + position.top) - winH;

        // if the modal overlaps the height of the window
        // calculate possible height and set
        // nanoScroller needs an re-init after every change
        // TODO change nanoScroller default selectors / css to custom in order to avoid theme conflicts
        if (winDiff > 0) {
            this.initScrollbars(conH - (winDiff + 30));
        }
        //
        else if ((conH - position.top ) < winH) {
            this.initScrollbars(conH);

        } else {
            this.initScrollbars((winH - position.top));
        }

        // be aware of WP admin bar
        // TODO maybe check if admin bar is around
        if (position.top < 40) {
            this.$el.css('top', '40px');
        }

        _K.info('Frontend Modal resizing done!');
    },
    initScrollbars: function (height) {
        jQuery('.nano', this.$el).height(height);
        jQuery('.nano').nanoScroller({preventPageScrolling: true});
        _K.info('Nano Scrollbars (re)initialized!');
    },
// Serialize current form fields and send it to the server
    serialize: function (mode, showNotice) {
        _K.info('Frontend Modal called serialize function. Savemode', save);
        var that = this;
        var save = mode || false;
        var notice = (showNotice !== false);
        tinymce.triggerSave();
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'updateModuleOptions',
                data: that.$form.serialize().replace(/\'/g, '%27'),
                module: that.model.toJSON(),
                editmode: (save) ? 'update' : 'preview',
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {

                jQuery('.editable', that.options.view.$el).each(function (i, el) {
                    tinymce.remove('#' + el.id);
                });

//                _.each(jQuery('.module', that.options.view.$el), function(el){
//                    KB.Views.Modules.remove(el.id);
//                });
                var height = that.options.view.$el.height();

                that.options.view.$el.height(height);
                that.options.view.$el.html(res.html);
                that.options.view.$el.css('height', 'auto');

                that.model.set('moduleData', res.newModuleData);
                jQuery(document).trigger('kb:module-update-' + that.model.get('settings').id, that.options.view);
                that.model.view.delegateEvents();
                that.model.view.trigger('kb:moduleUpdated');
                that.view.trigger('kb:frontend::viewUpdated');
                KB.Events.trigger('KB::ajax-update');

                KB.trigger('kb:frontendModalUpdated');

                setTimeout(function () {
                    jQuery('.editable', that.options.view.$el).each(function (i, el) {
                        KB.IEdit.Text(el);
                    });
                    that.model.view.render();

                }, 400);

                if (save) {
                    if (notice){
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, 'success');
                    }
                    that.$el.removeClass('isDirty');
                    that.model.view.getClean();
                    that.trigger('kb:frontend-save');
                } else {
                    if (notice){
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, 'success');
                    }
                    that.$el.addClass('isDirty');

                }

                _K.info('Frontend Modal saved data for:' + that.model.get('instance_id'));

            },
            error: function () {
                console.log('e');
            }
        });
    },


    // delay keyup events and only fire the last
    delayInput: function () {
        var that = this;

        if (this.options.timerId) {
            clearTimeout(this.options.timerId);
        }

        this.options.timerId = setTimeout(function () {
            that.options.timerId = null;
            that.serialize(false, false);
        }, 750);
    },
// TODO handling events changed in TinyMce 4 to 'on'
    attachEditorEvents: function (ed) {
        var that = this;
        ed.onKeyUp.add(function () {
            that.delayInput();
        });
    },
    destroy: function () {
        var that = this;
        this.$el.fadeTo(500,0, function(){
            that.unload();
            that.unbind();
            that.remove();
            KB.FrontendEditModal = null;
        });

    },
    unload: function () {
        this.unset();
        jQuery('.wp-editor-area', this.$el).each(function (i, item) {
            tinymce.remove('#' + item.id);
        });


    },
// Modules can pass special settings to manipulate the modal
// By now it's limited to the width
// Maybe extended as usecases arise
    applyControlsSettings: function ($el) {
        var settings = this.model.get('settings');
        if (settings.controls && settings.controls.width) {
            $el.css('width', settings.controls.width + 'px');
        }
    }
});