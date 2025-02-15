/* External dependencies */
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { isNil } from 'lodash';

/* Internal dependencies */
import {
  getTitle,
  getContent,
  getDistance,
  getHashTags,
  getRoutes,
  getSpots,
  getImages,
  getRoadId,
  getSuccess,
  getError,
  getErrorMessage,
  getCategoryId,
  getPlaceCode,
} from 'stores/selectors/editSelectors';
import {
  initialize,
  requestCreateRoad,
  requestUpdateRoad,
} from 'stores/actions/editActions';
import { openSnackbar } from 'stores/actions/layoutActions';
import { getQueryParam } from 'utils/urlUtils';
import Header from 'components/modules/Header';
import RoadTitle from 'components/modules/RoadTitle';
import RoadMap from 'components/modules/RoadMap';
import RoadHashTag from 'components/modules/RoadHashTag';
import RoadContent from 'components/modules/RoadContent';
import RoadSubmit from 'components/modules/RoadSubmit';
import RoadCategory from 'components/modules/RoadCategory';
import RoadImageUploader from 'components/modules/RoadImageUploader';

declare global {
  interface Window {
    webkit: any;
  }
}

function MakeRoad() {
  const dispatch = useDispatch();
  const router = useRouter();

  const title = useSelector(getTitle);
  const content = useSelector(getContent);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const distance = useSelector(getDistance);
  const hashtags = useSelector(getHashTags);
  const routes = useSelector(getRoutes);
  const spots = useSelector(getSpots);
  const images = useSelector(getImages);
  const categoryId = useSelector(getCategoryId);
  const placeCode = useSelector(getPlaceCode);

  const hasSuccess = useSelector(getSuccess);
  const hasError = useSelector(getError);
  const errorMessage = useSelector(getErrorMessage);
  const successRoadId = useSelector(getRoadId);

  const [roadId, setRoadId] = useState('');

  const handleClickClose = useCallback(() => {
    if (window.webkit) {
      window.webkit.messageHandlers.handler.postMessage({
        function: 'close',
      });
    }
    router.back();
  }, [router]);

  const handleSubmit = useCallback(() => {
    if (roadId !== 'new') {
      const payload = {
        roadId,
        title,
        content,
        distance: 3,
        categoryId,
        routes: routes
          .toArray()
          .map((route) => [route.longitude, route.latitude]),
        placeCode,
        spots: spots.toArray().map((spot) => ({
          title: spot.title,
          content: spot.content,
          point: [spot.point.longitude, spot.point.latitude],
        })),
        hashtags: hashtags.toArray(),
        images: images.toArray(),
      };

      dispatch(requestUpdateRoad(payload));
    } else {
      const payload = {
        title,
        content,
        distance: 3,
        categoryId,
        routes: routes
          .toArray()
          .map((route) => [route.longitude, route.latitude]),
        placeCode,
        spots: spots.toArray().map((spot) => ({
          title: spot.title,
          content: spot.content,
          point: [spot.point.longitude, spot.point.latitude],
        })),
        hashtags: hashtags.toArray(),
        images: images.toArray(),
      };

      dispatch(requestCreateRoad(payload));
    }
  }, [
    roadId,
    title,
    content,
    categoryId,
    routes,
    placeCode,
    spots,
    hashtags,
    images,
    dispatch,
  ]);

  useEffect(() => {
    const roadIdFromQueryParam = getQueryParam('roadId');
    if (!isNil(roadIdFromQueryParam)) {
      setRoadId(roadIdFromQueryParam);
    }
  }, []);

  useEffect(() => {
    if (hasSuccess) {
      router.replace(`/detail?roadId=${successRoadId}`);
    }
  }, [hasSuccess, router, successRoadId]);

  useEffect(() => {
    dispatch(initialize());

    return () => {
      dispatch(initialize());
    };
  }, [dispatch]);

  useEffect(() => {
    if (hasError) {
      dispatch(openSnackbar({ type: 'error', message: errorMessage }));
    }
  }, [dispatch, errorMessage, hasError]);

  return (
    <Wrapper>
      <RoadHeader
        title="길 등록하기"
        showCloseIcon
        onClickClose={handleClickClose}
      />
      <ItemWrapper>
        <RoadTitle />
        <RoadMap />
        <RoadHashTag />
        <RoadCategory />
        <RoadImageUploader />
        <RoadContent />
        <RoadSubmit onSubmit={handleSubmit} />
      </ItemWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const RoadHeader = styled(Header)`
  position: sticky !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100000;
`;

const ItemWrapper = styled.div`
  width: 100%;
  height: auto;
  padding: 0 16px 30px;
  box-sizing: border-box;
`;

export default MakeRoad;
