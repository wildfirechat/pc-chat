import React from 'react';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { inject, observer } from 'mobx-react';

@inject(stores => ({
    togglePreviewImage: stores.chat.togglePreviewImage,
    toPreivewImageOption: stores.chat.toPreivewImageOption,
    previewImage: stores.chat.previewImage,
}))
@observer
export default class PreviewImage extends React.Component {
    componentDidMount() {
    };

    componentWillUnmount() {
    };

    render() {
        const { previewImage } = this.props;
        let images = this.props.toPreivewImageOption.images;
        let current = this.props.toPreivewImageOption.current;

        return (
            <ModalGateway>
                {previewImage ? (
                    <Modal onClose={this.props.togglePreviewImage}>
                        <Carousel views={images} currentIndex={current} />
                    </Modal>
                ) : null}
            </ModalGateway>
        );
    }
}
