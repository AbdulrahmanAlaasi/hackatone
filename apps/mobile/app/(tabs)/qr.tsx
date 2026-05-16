import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, H1, P, Screen } from '../../src/components/ui';
import { tokens } from '../../src/theme';

export default function QrTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }} edges={['top']}>
      <Screen>
        <H1>My QR</H1>
        <Card>
          <P>
            Open a hackathon from the Home tab to see your QR code. The dedicated QR screen lands in
            Prompt 8.
          </P>
        </Card>
      </Screen>
    </SafeAreaView>
  );
}
