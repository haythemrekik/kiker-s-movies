-- Correctif RLS : Permettre aux clients de voir les vidéos pour lesquelles ils ont un video_views
-- (preuve qu'ils ont racheté un code d'accès)

DROP POLICY IF EXISTS "Clients can see videos via redeemed codes" ON public.videos;

CREATE POLICY "Clients can see videos via redeemed codes"
    ON public.videos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.video_views vv
            WHERE vv.video_id = id
            AND vv.user_id = auth.uid()
        )
    );
